import { Navigate, Route, Routes } from "react-router"
import { ChatPage } from "./pages/ChatPage"
import { LoginPage } from "./pages/LoginPage"
import { SignUpPage } from "./pages/SignUpPage"
import {Background} from "./components/Background"
import { useAuthStore } from "./store/useAuthStore"
import { useEffect } from "react"
import { PageLoader } from "./components/PageLoader"
import {Toaster} from "react-hot-toast"

export const App = function(){
  const {authUser,isCheckingAuth,checkAuth} = useAuthStore();

  useEffect(()=>{   //runs only when dependency changes, i.e checkAuth
    checkAuth();
  },[checkAuth]);

  console.log(authUser);
  //make sure to add refresh token from frontend

  if(isCheckingAuth) return <PageLoader></PageLoader>

  return (
  <Background>
  <Routes>
    <Route path="/" element = { authUser? <ChatPage></ChatPage> : <Navigate to={"/login"}></Navigate>}/>
    <Route path="/login" element={ !authUser ? <LoginPage></LoginPage> : <Navigate to={"/"}></Navigate>}></Route>
    <Route path="/signup" element={ !authUser ? <SignUpPage></SignUpPage> : <Navigate to={"/"}></Navigate>}></Route>
  </Routes>
  <Toaster/>
   </Background> 
  )
}

