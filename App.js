// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingPage from './Screens/Landing.js'; 
import Login from './Screens/Login.js';
import Register from './Screens/Register.js';
import Homescreen from './Screens/Homescreen.js';
import LoggedinNavigator from './Screens/LoggedinNavigator.js'
import { AuthenticationContext } from './context/userContext.js';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    
    <AuthenticationContext>
      {/* <NavigationContainer>
      <LoggedinNavigator></LoggedinNavigator>
      </NavigationContainer> */}
       <NavigationContainer>
         <Stack.Navigator initialRouteName="Landing">
           <Stack.Screen name="Landing" component={LandingPage} options={{ headerShown: false }} />
           <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
           <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
           <Stack.Screen name="Home" component={LoggedinNavigator} options={{ headerShown: false }} />
         </Stack.Navigator>
       </NavigationContainer>
    </AuthenticationContext>
  );
};

export default App;


/* <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />*/