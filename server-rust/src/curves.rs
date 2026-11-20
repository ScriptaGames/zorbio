//! Curve generation for bot wander paths and the "curves" food map.
//! Ports of:
//!   - common/CurveExtras.js (GrannyKnot, TrefoilKnot, CinquefoilKnot)
//!   - common/CurvePaths.js (randomWander, grannyKnot, trefoilKnot, cinquefoilKnot)
//!   - three.js r88 CatmullRomCurve3 (chordal, closed) + Curve.getPoints
//!   - common/util.js randomWanderPath

use rand::Rng;

use crate::config::Config;
use crate::util::{get_random_int_inclusive, random_world_position, Vector3};

/// This was the size that the scales and offsets were calibrated against.
const CALIBRATED_WORLD_SIZE: f64 = 2000.0;

/// THREE.Curves.GrannyKnot.getPoint
fn granny_knot_point(t: f64, scale: f64, offset: &Vector3) -> Vector3 {
    let t = 2.0 * std::f64::consts::PI * t;

    let x = -0.22 * t.cos() - 1.28 * t.sin() - 0.44 * (3.0 * t).cos() - 0.78 * (3.0 * t).sin();
    let y = -0.1 * (2.0 * t).cos() - 0.27 * (2.0 * t).sin() + 0.38 * (4.0 * t).cos() + 0.46 * (4.0 * t).sin();
    let z = 0.7 * (3.0 * t).cos() - 0.4 * (3.0 * t).sin();

    Vector3::new(x * scale + offset.x, y * scale + offset.y, z * scale + offset.z)
}

/// THREE.Curves.TrefoilKnot.getPoint
fn trefoil_knot_point(t: f64, scale: f64, offset: &Vector3) -> Vector3 {
    let t = std::f64::consts::PI * 2.0 * t;

    let x = (2.0 + (3.0 * t).cos()) * (2.0 * t).cos();
    let y = (2.0 + (3.0 * t).cos()) * (2.0 * t).sin();
    let z = (3.0 * t).sin();

    Vector3::new(x * scale + offset.x, y * scale + offset.y, z * scale + offset.z)
}

/// THREE.Curves.CinquefoilKnot.getPoint
fn cinquefoil_knot_point(t: f64, scale: f64, offset: &Vector3) -> Vector3 {
    let p = 2.0;
    let q = 5.0;

    let t = std::f64::consts::PI * 2.0 * t;

    let x = (2.0 + (q * t).cos()) * (p * t).cos();
    let y = (2.0 + (q * t).cos()) * (p * t).sin();
    let z = (q * t).sin();

    Vector3::new(x * scale + offset.x, y * scale + offset.y, z * scale + offset.z)
}

/// THREE.Curve.getPoints(divisions): divisions + 1 samples.
fn sample_curve(divisions: usize, get_point: impl Fn(f64) -> Vector3) -> Vec<Vector3> {
    let mut points = Vec::with_capacity(divisions + 1);
    for d in 0..=divisions {
        points.push(get_point(d as f64 / divisions as f64));
    }
    points
}

/// three.js r88 CatmullRomCurve3 (curveType 'chordal', closed) getPoint.
struct CubicPoly {
    c0: f64,
    c1: f64,
    c2: f64,
    c3: f64,
}

impl CubicPoly {
    fn new() -> Self {
        CubicPoly { c0: 0.0, c1: 0.0, c2: 0.0, c3: 0.0 }
    }

    fn init(&mut self, x0: f64, x1: f64, t0: f64, t1: f64) {
        self.c0 = x0;
        self.c1 = t0;
        self.c2 = -3.0 * x0 + 3.0 * x1 - 2.0 * t0 - t1;
        self.c3 = 2.0 * x0 - 2.0 * x1 + t0 + t1;
    }

    fn init_nonuniform_catmull_rom(&mut self, x0: f64, x1: f64, x2: f64, x3: f64, dt0: f64, dt1: f64, dt2: f64) {
        // compute tangents when parameterized in [t1,t2]
        let mut t1 = (x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1;
        let mut t2 = (x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2;

        // rescale tangents for parametrization in [0,1]
        t1 *= dt1;
        t2 *= dt1;

        self.init(x1, x2, t1, t2);
    }

    fn calc(&self, t: f64) -> f64 {
        let t2 = t * t;
        let t3 = t2 * t;
        self.c0 + self.c1 * t + self.c2 * t2 + self.c3 * t3
    }
}

/// CatmullRomCurve3 with curveType 'chordal' and closed=true, sampled at
/// `divisions` + 1 points (Curve.getPoints).
pub fn catmull_rom_chordal_closed_points(points: &[Vector3], divisions: usize) -> Vec<Vector3> {
    let l = points.len();
    if l < 2 {
        return points.to_vec();
    }

    let mut out = Vec::with_capacity(divisions + 1);
    let mut px = CubicPoly::new();
    let mut py = CubicPoly::new();
    let mut pz = CubicPoly::new();

    for d in 0..=divisions {
        let t = d as f64 / divisions as f64;

        let p = (l as f64 - 0.0) * t; // closed => (l - 0) * t
        let mut int_point = p.floor() as i64;
        let weight = p - int_point as f64;

        // closed wrapping
        if int_point > 0 {
            // intPoint += 0
        } else {
            int_point += ((int_point.abs() as f64 / l as f64).floor() as i64 + 1) * l as i64;
        }

        let iu = |i: i64| -> usize { (i.rem_euclid(l as i64)) as usize };

        let p0 = points[iu(int_point - 1)];
        let p1 = points[iu(int_point)];
        let p2 = points[iu(int_point + 1)];
        let p3 = points[iu(int_point + 2)];

        // chordal
        let pow = 0.5;
        let mut dt0 = p0.distance_to_squared(&p1).powf(pow);
        let mut dt1 = p1.distance_to_squared(&p2).powf(pow);
        let mut dt2 = p2.distance_to_squared(&p3).powf(pow);

        // safety check for repeated points
        if dt1 < 1e-4 {
            dt1 = 1.0;
        }
        if dt0 < 1e-4 {
            dt0 = dt1;
        }
        if dt2 < 1e-4 {
            dt2 = dt1;
        }

        px.init_nonuniform_catmull_rom(p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2);
        py.init_nonuniform_catmull_rom(p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2);
        pz.init_nonuniform_catmull_rom(p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2);

        out.push(Vector3::new(px.calc(weight), py.calc(weight), pz.calc(weight)));
    }

    out
}

/// UTIL.randomWanderPath(numPoints, divide, segments)
pub fn random_wander_path(cfg: &Config, num_points: usize, divide: f64, segments: usize) -> Vec<Vector3> {
    let mut random_positions = Vec::with_capacity(num_points);
    for _ in 0..num_points {
        random_positions.push(random_world_position(cfg, divide));
    }

    // Random world points closed loop a large path
    catmull_rom_chordal_closed_points(&random_positions, segments)
}

/// ZOR.CurvePaths - a curated list of curve paths that fit in the game.
pub struct CurvePaths;

impl CurvePaths {
    /// getRandomCurve(): sample one of the registered curves, reverse it 50% of
    /// the time.
    pub fn get_random_curve(cfg: &Config, rng: &mut impl Rng) -> Vec<Vector3> {
        let curves = ["randomWander", "grannyKnot", "trefoilKnot", "cinquefoilKnot"];
        let curve_name = curves[crate::util::get_random_int_inclusive(rng, 0, curves.len() as i64 - 1) as usize];

        if cfg.debug {
            crate::zlog!("using curve: {}", curve_name);
        }

        let mut curve_points = match curve_name {
            "randomWander" => Self::random_wander(cfg),
            "grannyKnot" => Self::granny_knot(cfg, rng),
            "trefoilKnot" => Self::trefoil_knot(cfg, rng),
            _ => Self::cinquefoil_knot(cfg, rng),
        };

        // 50% of the time reverse direction
        if get_random_int_inclusive(rng, 1, 2) == 2 {
            curve_points.reverse();
        }

        curve_points
    }

    /// UTIL.randomWanderPath(10, 1.2, 300)
    fn random_wander(cfg: &Config) -> Vec<Vector3> {
        random_wander_path(cfg, 10, 1.2, 300)
    }

    /// An elegant interlocking knot.
    fn trefoil_knot(cfg: &Config, rng: &mut impl Rng) -> Vec<Vector3> {
        let world_size_delta = cfg.world_size / CALIBRATED_WORLD_SIZE;
        let scale_max = 120.0 * world_size_delta;
        let scale_min = 70.0 * world_size_delta;
        let offset_xy = 600.0 * world_size_delta;
        let offset_z = 800.0 * world_size_delta;

        let scale = get_random_int_inclusive(rng, scale_min as i64, scale_max as i64) as f64;
        let segments = (scale * 1.5) as usize;

        let offset = Vector3::new(
            get_random_int_inclusive(rng, -offset_xy as i64, offset_xy as i64) as f64,
            get_random_int_inclusive(rng, -offset_xy as i64, offset_xy as i64) as f64,
            get_random_int_inclusive(rng, -offset_z as i64, offset_z as i64) as f64,
        );

        sample_curve(segments, |t| trefoil_knot_point(t, scale, &offset))
    }

    /// A weird knot with no pattern.
    fn granny_knot(cfg: &Config, rng: &mut impl Rng) -> Vec<Vector3> {
        let world_size_delta = cfg.world_size / CALIBRATED_WORLD_SIZE;
        let scale_max = 300.0 * world_size_delta;
        let scale_min = 150.0 * world_size_delta;
        let offset_x = 425.0 * world_size_delta;
        let offset_y = 575.0 * world_size_delta;
        let offset_z = 625.0 * world_size_delta;

        let scale = get_random_int_inclusive(rng, scale_min as i64, scale_max as i64) as f64;
        let segments = (scale * 1.1) as usize;

        let offset = Vector3::new(
            get_random_int_inclusive(rng, -offset_x as i64, offset_x as i64) as f64,
            get_random_int_inclusive(rng, -offset_y as i64, offset_y as i64) as f64,
            get_random_int_inclusive(rng, -offset_z as i64, offset_z as i64) as f64,
        );

        sample_curve(segments, |t| granny_knot_point(t, scale, &offset))
    }

    /// A really cool wide wheel spiral.
    fn cinquefoil_knot(cfg: &Config, rng: &mut impl Rng) -> Vec<Vector3> {
        let world_size_delta = cfg.world_size / CALIBRATED_WORLD_SIZE;
        let scale_max = 200.0 * world_size_delta;
        let scale_min = 80.0 * world_size_delta;
        let offset_x = 350.0 * world_size_delta;
        let offset_y = 350.0 * world_size_delta;
        let offset_z = 600.0 * world_size_delta;

        let scale = get_random_int_inclusive(rng, scale_min as i64, scale_max as i64) as f64;
        let segments = (scale * 2.5) as usize;

        let offset = Vector3::new(
            get_random_int_inclusive(rng, -offset_x as i64, offset_x as i64) as f64,
            get_random_int_inclusive(rng, -offset_y as i64, offset_y as i64) as f64,
            get_random_int_inclusive(rng, -offset_z as i64, offset_z as i64) as f64,
        );

        sample_curve(segments, |t| cinquefoil_knot_point(t, scale, &offset))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trefoil_knot_point_check() {
        // t=0: x=(2+cos0)*cos0=3, y=0, z=0
        let p = trefoil_knot_point(0.0, 10.0, &Vector3::new(0.0, 0.0, 0.0));
        assert!((p.x - 30.0).abs() < 1e-9);
        assert!(p.y.abs() < 1e-9);
        assert!(p.z.abs() < 1e-9);
    }

    #[test]
    fn catmull_rom_closed_periodic() {
        // closed chordal catmull rom should be periodic: t=0 and t=1 produce
        // the same point (both sample segment 0 at weight 0).
        let points = vec![
            Vector3::new(0.0, 0.0, 0.0),
            Vector3::new(10.0, 5.0, 0.0),
            Vector3::new(20.0, -5.0, 3.0),
            Vector3::new(5.0, 8.0, -2.0),
        ];
        let sampled = catmull_rom_chordal_closed_points(&points, 100);
        assert_eq!(sampled.len(), 101);
        let a = sampled[0];
        let b = sampled[100];
        assert!((a.x - b.x).abs() < 1e-9);
        assert!((a.y - b.y).abs() < 1e-9);
        assert!((a.z - b.z).abs() < 1e-9);
    }
}
