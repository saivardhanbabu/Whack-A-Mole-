import "./Login.css";
import { useForm } from "react-hook-form";
import { userLoginThunk } from "../../redux/slices/userLoginSlice";
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useState } from "react";

function Login() {
  let { register, handleSubmit, formState: { errors } } = useForm();
  let dispatch = useDispatch();
  let navigate = useNavigate()
  const { isPending, currentUser, errorStatus, errorMessage, loginStatus } = useSelector(state => state.userLogin)
  let [err,setErr]=useState('')
  function onSignUpFormSubmit(userCred) {
    let actionObj = userLoginThunk(userCred)
    dispatch(actionObj)
    console.log(userCred)
    console.log(loginStatus)
    if(loginStatus==false){
        setErr("Please check you credentials")
    }
  }

  useEffect(() => {
    if (loginStatus === true) {
      navigate("/game")
    }
  }, [loginStatus])


  return (
    <div class="container1" className="container1">
      <div class="card" className="row justify-content-center mt-5">
        <div className="col-lg-4 col-md-6 col-sm-6">
            <div className="card-title text-center">
              <h2 className="p-3 text-light">Log In</h2>
            </div>
            <div className="card-body bg-succcess">
            
              <form onSubmit={handleSubmit(onSignUpFormSubmit)}>
              {err.length!==0&&<p className="text-danger text-center">{err}</p>}
                <div className="mb-4">
                  <input
                    type="text"
                    className="form-control"
                    style={{backgroundColor:"transparent"}}
                    placeholder="Username"
                    id="username"
                    {...register("username", { required: true, minLength: 4, maxLength: 20 })}
                  />
                  {errors.username && errors.username.type === "required" && <p className="text-danger">Username is required.</p>}
                  {errors.username && errors.username.type === "minLength" && <p className="text-danger">Username must be at least 4 characters long.</p>}
                  {errors.username && errors.username.type === "maxLength" && <p className="text-danger">Username cannot exceed 20 characters.</p>}
                </div>
                <div className="mb-4">
                  <input
                    type="password"
                    className="form-control"
                    style={{backgroundColor:"transparent"}}
                    placeholder="Password"
                    id="password"
                    {...register("password", { required: true, minLength: 4, maxLength: 20 })}
                  />
                  {errors.password && errors.password.type === "required" && <p className="text-danger">Password is required.</p>}
                  {errors.password && errors.password.type === "minLength" && <p className="text-danger">Password must be at least 4 characters long.</p>}
                  {errors.password && errors.password.type === "maxLength" && <p className="text-danger">Password cannot exceed 20 characters.</p>}
                </div>
                <div className="justify-content-center">
                  <button
                    type="submit"
                    className="text-light"
                    style={{backgroundColor:"transparent"}}
                  >
                    Log In
                  </button>
                </div>
              </form>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Login;