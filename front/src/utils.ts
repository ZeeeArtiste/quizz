import { ElNotification } from "element-plus";
import 'element-plus/dist/index.css'
import { type Router } from "vue-router";
import userStore from "@/store/userStore";


export const notification = (title: string, message: string, type: | "success" | "warning" | "error" | "info") => {
    ElNotification({
        title: title,
        message: message,
        type: type
    })
}

export const logout = async (router: Router, displayNotification: boolean = true) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            new Error('Une erreur est survenue')
        }
        userStore.clearUser();
        router.push("/login");
        if (displayNotification)
            notification("Déconnexion réussie", "Vous avez été déconnecté avec succès", "success")
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        if (displayNotification)
            notification("Un problème est survenue", "Problème lors de la déconnexion", "error");
    }
};



export const isAuthenticated = async (router?: Router) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-token`, {
            method: "GET",
            credentials: 'include',
        });
        if (!response.ok) {
            if (router)
                logout(router, false)
        }
        return response.ok;
    } catch (error) {
        console.error("Erreur de vérification de l'authentification:", error);
        return false;
    }
};
