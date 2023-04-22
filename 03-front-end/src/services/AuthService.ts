import api from '../Api/api';
import { saveAuthToken, saveRefreshToken, ApiRole } from '../Api/api';
import EventRegister from '../Api/EventRegister';
interface IUserLogIn {
    username: string,
    password: string
}


export default class AuthService {
    public static korisnikLogIn(data: IUserLogIn) {
        api("post", "/auth/korisnik/prijava", "korisnik", data, false, false)
        .then(res => {
            if(res.status === "ok") {
                const authToken = res.data.authToken ?? ""
                const refreshToken = res.data.refreshToken ?? ""

                saveAuthToken("korisnik", authToken);
                saveRefreshToken("korisnik", refreshToken);

                if(res.data.isPrvaPrijava === 1) {
                    EventRegister.emit("AUTH_EVENT", "korisnik_login_prva_prijava");
                    return;
                }

                EventRegister.emit("AUTH_EVENT", "korisnik_logIn_uspesno")
            } else {
                EventRegister.emit("AUTH_EVENT", "korisnik_login_neuspelo", res.data)
            }
        })
        .catch(err => {
            EventRegister.emit("AUTH_EVENT", "korisnik_login_neuspelo", err)   
        });

    }

    public static sluzbenikLogIn(data: IUserLogIn) {
        api("post", "/auth/sluzbenik/prijava", "sluzbenik", data, true, false)
        .then(res => {
            console.log(res);
            if(res.status === "ok") {
                const authToken = res.data.authToken ?? ""
                const refreshToken = res.data.refreshToken ?? ""

                saveAuthToken("sluzbenik", authToken);
                saveRefreshToken("sluzbenik", refreshToken)

                EventRegister.emit("AUTH_EVENT", "sluzbenik_logIn_uspesno")
            } else {
                EventRegister.emit("AUTH_EVENT", "sluzbenik_login_neuspelo", res.data)
            }
        })
        .catch(err => {
            EventRegister.emit("AUTH_EVENT", "sluzbenik_login_neuspelo", err)   
        });

    }

   
}