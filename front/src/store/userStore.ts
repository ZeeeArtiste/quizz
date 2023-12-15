import { isAuthenticated } from '@/utils';
import { ref } from 'vue';

let email = ref<string | null>(localStorage.getItem("email"));
const userIsAuthenticed = ref<boolean>(await isAuthenticated());


const setEmail = (email_: string | null) => {
    email.value = email_
    email_ ?
        localStorage.setItem("email", email_)
        :
        localStorage.removeItem('email')

}

const clearUser = () => {
    userIsAuthenticed.value = false
}

const setAuth = (email_: string) => {
    setEmail(email_);
    userIsAuthenticed.value = true;
}

export default {
    userIsAuthenticed,
    email,
    setEmail,
    clearUser,
    setAuth
};
