<?php 
class JSONObject extends stdClass {

	// Accepts an array, object, or JSON encoded string.
	public function __construct( $o=null ) {
		if( $o === null ) {
			return;
		}
		if( is_string( $o ) ) {
			$o = json_decode( $o );
		}
		if( is_object( $o ) || is_array( $o ) ) {
			$this->cast( $o );
		}
	}

	// When this object is cast to a string, a JSON encoded string is returned.
	public function __toString() {
		return json_encode( $this );
	}
	
	// When this object is cast to a string, a JSON encoded string is returned.
	public function has($name) {
		if( isset( $this->$name ) ) {
			return $this->$name;
		}
		return null;
	}

	// Returns NULL when an unset property is accessed.
	public function __get( $name ) {
		if( isset( $this->$name ) ) {
			return $this->$name;
		}
		return null;
	}
	
	
    /**
     * Put a key pair in the JSONObject.
     *
     * @param key   A key string.
     * @param value A value.
     * @return this.
     * @throws JSONException If the key is null.
     */
	public function put($key, $value) {
        
		$this->$key = $value;
		return $this;
		
    }
	
	// Returns NULL when an unset property is accessed.
	public function getJSONArray($name) {
		if( isset( $this->$name ) ) {
			return $this->$name;
		}
		return null;
	}
	
	// Returns NULL when an unset property is accessed.
	public function remove($key) {
		unset($this->$key);
		//return null;
	}
	
	// For internal use, maps/casts an array or object to this object.
	public function getNames( $o ) {
		$keyValue = array();
		if( is_string( $o ) ) {
			$o = json_decode( $o );
		}
		foreach($o as $k => $v) {
			if( is_object( $v ) ) {
				$this->$k = new JSONObject( $v );
				continue;
			}
			array_push($keyValue, $k); 
			$this->$k = $k;
		}
		return $keyValue;
	}
	// For internal use, maps/casts an array or object to this object.
	private function cast( $o ) {
		foreach( $o as $k => $v ) {
			if( is_object( $v ) ) {
				$this->$k = new JSONObject( $v );
				continue;
			}
			$this->$k = $v;
		}
	}

}

// BASIC EXAMPLE OF USE //

$o1 = new JSONObject();
$o1->apple  = 'green';
$o1->banana = 'yellow';

//echo $o1; // output: {"apple":"green","banana":"yellow"}

$o2 = new JSONObject( '{
    "app42": {
        "response": {
            "success": true,
            "user": {
                "userName": "rohisssd",
                "email": "sushil.bhadouria@shephertz.co.in"
            }
        }
    }
}' );

/*echo $o2->app42->response->user->email;  // output: green
//echo $o2->banana; // output: yellow
$o3 = $o2->__get("app42");
echo $o3->__get("response");*/
?>