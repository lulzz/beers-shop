import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const cartSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    errors: {},
    message: '',
  },
  reducers: {
    userSignedup: (state, { payload }) => {
      state.errors = {};
      state.message = payload;
    },
    userErrorsSet: (state, { payload }) => {
      state.errors = payload.errors;
      state.message = payload.message;
    },
    accountVerified: (state, { payload }) => {
      state.message = payload;
    },
    loggedIn: (state, { payload: user }) => {
      state.user = user;
    },
    loginErrors: (state, { payload }) => {
      state.message = payload;
    },
    errorsCleard: state => {
      state.errors = {};
      state.message = '';
    },
    setMessage: (state, { payload }) => {
      state.message = payload;
    },
    userUpdated: (state, { payload }) => {
      state.user = payload;
    },
    setUser: (state, { payload }) => {
      state.user = payload || null;
    },
    loggedOut: state => {
      state.user = null;
      state.errors = {};
      state.message = '';
    },
    passwordUpdated: (state, { payload }) => {
      state.user = payload.user;
      state.message = payload.message;
    },
    passReseted: (state, action) => {
      state.message = 'Please login with new password.';
    },
  },
});

// export actions
export const {
  userErrorsSet,
  userSignedup,
  accountVerified,
  loggedIn,
  loginErrors,
  errorsCleard,
  setMessage,
  userUpdated,
  setUser,
  loggedOut,
  passwordUpdated,
  passReseted,
} = cartSlice.actions;

// thunk
export const signup = user => async dispatch => {
  // activate loader
  try {
    const {
      data: { data },
    } = await axios.post('/api/v1/users/signup', user);

    dispatch(userSignedup(data.message));
  } catch (err) {
    dispatch(userErrorsSet(err.response.data));
  }
};

export const login = user => async dispatch => {
  try {
    const {
      data: { data },
    } = await axios.post('/api/v1/users/login', user);

    return dispatch(loggedIn(data.user));
  } catch (err) {
    dispatch(loginErrors(err.response.data.message));
    console.log(err.response);
  }
};

export const verifyAccount = token => async dispatch => {
  // laoder
  try {
    await axios.get(`/api/v1/users/account/confirm/${token}`);

    dispatch(accountVerified("You're account has been verified"));
  } catch (err) {
    console.log(err.response);
  }
};

export const resendToken = email => async dispatch => {
  try {
    const {
      data: { data },
    } = await axios.post('/api/v1/users/resend-token', email);

    dispatch(setMessage(data.message));
  } catch (err) {
    if (!err.response.data.error) {
      dispatch(dispatch(setMessage(err.response.data.message)));
    } else {
      console.log(err.response);
    }
  }
};

export const getMe = () => async dispatch => {
  try {
    const {
      data: { data },
    } = await axios.get('/api/v1/users/me');

    dispatch(setUser(data.user));
  } catch (err) {
    console.log(err.response);
  }
};

export const updateMe = user => async dispatch => {
  try {
    const {
      data: { data },
    } = await axios.patch('/api/v1/users/update/me', user);

    dispatch(setUser(data.user));
  } catch (err) {
    console.log(err.response);
  }
};

export const logout = () => async dispatch => {
  try {
    await axios.get('/api/v1/users/logout');

    return dispatch(loggedOut());
  } catch (err) {
    console.log(err.response);
  }
};

// patch
export const updatePassword = passData => async dispatch => {
  try {
    const {
      data: { data },
    } = await axios.patch('/api/v1/users/update-password', passData);

    dispatch(
      passwordUpdated({
        user: data.user,
        message: 'Password updated. Please login again.',
      })
    );
    return dispatch(loggedOut());
  } catch (err) {
    dispatch(userErrorsSet(err.response.data));
    console.log(err.response);
  }
};

export const resetPassword = (token, passData) => async dispatch => {
  try {
    await axios.post(`/api/v1/users/reset-password/${token}`, passData);

    dispatch(passReseted());
  } catch (err) {
    console.log(err.response.data);
  }
};

export const forgotPassword = email => async dispatch => {
  try {
    const { data } = await axios.post('/api/v1/users/forgot-password', {
      email,
    });
    dispatch(setMessage(data.data.message));
  } catch (err) {
    console.log(err.response);
  }
};

// _end

// selectors
export const selectErrors = state => state.user.errors;
export const selectUser = state => state.user.user;
export const selectMessage = state => state.user.message;

// export default
export default cartSlice.reducer;
