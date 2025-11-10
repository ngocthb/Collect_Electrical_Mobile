import axiosClient from '../config/axios';

const getTokenByLoginGoogle = async (token: string) => {
  try {
    console.log(token);
    const res = await axiosClient.post('/auth/login-google', { token: token });
    return res;
  } catch (e) {
    throw e;
  }
};

export default { getTokenByLoginGoogle };
