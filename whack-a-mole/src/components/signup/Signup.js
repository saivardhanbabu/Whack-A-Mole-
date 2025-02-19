import "./Signup.css";
import { useForm } from "react-hook-form";
import axios from 'axios'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'

function Signup() {
  let { register, handleSubmit, formState: { errors } } = useForm();
  let [err,setErr]=useState('')
  let navigate=useNavigate()

  async function onSignUpFormSubmit(userObj) {
    userObj={
      ...userObj,
      score:0
    }
    let res=await axios.post('http://localhost:4000/user-api/user',userObj)
    if(res.data.message==='User created' && userObj.password===userObj.cpassword){
      navigate("/signin")
    }
    else if(userObj.password!=userObj.cpassword){
        setErr("Paswords donot match")
    }
    else{
      setErr(res.data.message)
    }
    
  }

  return (
    <div className="container">
      <div className="row justify-content-center mt-2">
        <div className="col-lg-4 col-md-6 col-sm-6">
            <div className="card-title text-center">
              <h2 className="p-3 text-light">Register</h2>
            </div>
            <div className="card-body">

              
              <form onSubmit={handleSubmit(onSignUpFormSubmit)}>
              {err.length!==0&&<p className="text-danger text-center">{err}</p>}
                <div className="mb-4">
                  <input
                    type="text"
                    style={{backgroundColor:"transparent"}}
                    placeholder="Username"
                    className="form-control"
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
                    style={{backgroundColor:"transparent"}}
                    placeholder="Password"
                    className="form-control"
                    id="password"
                    {...register("password", { required: true, minLength: 6, maxLength: 20 })}
                  />
                  {errors.password && errors.password.type === "required" && <p className="text-danger">Password is required.</p>}
                  {errors.password && errors.password.type === "minLength" && <p className="text-danger">Password must be at least 6 characters long.</p>}
                  {errors.password && errors.password.type === "maxLength" && <p className="text-danger">Password cannot exceed 20 characters.</p>}
                </div>

                <div className="mb-4">
                  <input
                    type="password"
                    style={{backgroundColor:"transparent"}}
                    placeholder="Confirm Password"
                    className="form-control"
                    id="password"
                    {...register("cpassword", { required: true, minLength: 6, maxLength: 20 })}
                  />
                  {errors.password && errors.password.type === "required" && <p className="text-danger">Password is required.</p>}
                  {errors.password && errors.password.type === "minLength" && <p className="text-danger">Password must be at least 6 characters long.</p>}
                  {errors.password && errors.password.type === "maxLength" && <p className="text-danger">Password cannot exceed 20 characters.</p>}
                </div>

                <div className="text-end">
                  <button
                    type="submit"
                    className="text-light"
                    style={{backgroundColor:"transparent"}}
                  >
                    Register
                  </button>
                </div>
              </form>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;