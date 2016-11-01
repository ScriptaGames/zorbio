<?php

include_once 'ServiceAPI.php'; 
include_once 'App42Log.php';


/**
 * This class basically is a factory class which builds the service for use.
 * All services can be instantiated using this class
 * 
 */

class SampleApp{
	
    /**
     * Test Method for creating the User in App42 Cloud. 
     */
	
    public function createUser()
    {
        $api = new ServiceAPI("30de7e0dcf044cb4c5b46b606868a619a7057e727312392a0f346aafb3036e0f", "80375913972b990a07495686c40ebe012672aa9821d1999e19b9459a3f133191");
		$response = null;

        // FOR  Test Create USER
        $objUser = $api->buildUser();

        try {
             
          $userService = $this->sp->buildUserService();
            $userName = "toshantkaefdeffsdfsfkkar".  time();
            $eName = $userName.time()."ffasde@gmail.com";
            $createUserObj = $userService->createUser($userName, "password", $eName);
            print_r ($createUserObj->toString());
        } catch (App42BadParameterException $ex) {
            // Exception Caught
			// Check if User already Exist by checking app error code
            if ($ex->getAppErrorCode() == 2001) {
                // Do exception Handling for Already created User.
				
            }
        } catch (App42SecurityException $ex) {
            // Exception Caught
            // Check for authorization Error due to invalid Public/Private Key
            if ($ex.getAppErrorCode() == 1401) {
                // Do exception Handling here
            }
        } catch (App42Exception $ex) {
            // Exception Caught due to other Validation
        }
        // Render the JSON response. This will return the Successful created
        // User response
        App42Log::debug($response);
    }
	
}
$SampleAppObj = new SampleApp();
// Call to create User
$SampleAppObj->createUser();
	
?>