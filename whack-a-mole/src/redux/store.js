import {configureStore} from '@reduxjs/toolkit';
import userLoginReducer from './slices/userLoginSlice'
import React from 'react'

export const reduxStore=configureStore({
    reducer:{
        userLogin:userLoginReducer,
    }
})