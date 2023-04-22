import KorisnikModel from "../../../03-back-end/src/components/korisnik/model";
import api, { ApiRole } from "../Api/api";
import EventRegister from "../Api/EventRegister";

interface IEditPassowrd {
    password_hash_old: string,
    password_hash: string,
    password_hash_ponovo: string,
    isPrvaPrijava: boolean
}

interface IAddKorisnik {
    ime: string;
    prezime: string;
    brLicneKarte: string;
    jmbg: string;
    ulica: string,
    broj: string,
    mesto: string,
    opstinaRodjenja: string,
    mestoRodjenja: string,
    drzavaRodjenja: string,
    datumRodjenja: string,
    brTelefona: string;
    email: string;
}

interface ISearchKorisnik {
    ime: string | null,
    prezime: string | null,
    jmbg: string | null,
    brLicneKarte: string | null
}

interface IKorisnikId {
    korisnikId: number;
}

interface IEditKorisnik {
    ime: string,
    prezime: string,
    brTelefona: string,
    brLicneKarte: string,
    email: string,
    mesto: string,
    ulica: string,
    broj: string
}


interface IResult {
    success: boolean;
    message?: string;
    korisnik?: string;
}

export default class KorisnikService {
    public static getKorisnik(): Promise<KorisnikModel | null> {
        return new Promise<KorisnikModel | null>(reslove => {
            api("get", "/korisnici", "korisnik", null, true)
            .then(res => {
                if(res?.status !== "ok") {
                    if (res.status === "login") {
                        EventRegister.emit("AUTH_EVENT", "force_login");
                    }
                    return reslove(null);
                }

                reslove(res.data as KorisnikModel);
            });
        });
    }

    public static getKorisnikSluzbenik(): Promise<KorisnikModel | null> {
        return new Promise<KorisnikModel | null>(reslove => {
            api("get", "/korisniciSluzbenik", "sluzbenik", null, true)
            .then(res => {
                if(res?.status !== "ok") {
                    if (res.status === "login") {
                        EventRegister.emit("AUTH_EVENT", "force_login");
                    }
                    return reslove(null);
                }

                reslove(res.data as KorisnikModel);
            });
        });
    }

    public static changePassword(data: IEditPassowrd, role: ApiRole = "korisnik"): Promise<IResult> {
        return new Promise<IResult>(resolve => {
            api("post", "/korisniciIzmenaPassworda", role, data)
            .then(res => {
                console.log(res);
                if(res?.status === "error") {
                    if(Array.isArray(res?.data)) {
                        return resolve({
                            success: false,
                            message: res.data[0].data,
                        });
                    }
                }
               
                return resolve({
                    success: true,
                });
            })
        });
    }

    public static addKorisnik(data: IAddKorisnik, role: ApiRole = "sluzbenik"): Promise<IResult> {
        return new Promise<IResult>(resolve => {
            api("post", "/korisnikAdd", role, data, true)
            .then(res => {
                console.log(res);
                if(res?.status === "error") {
                    if(Array.isArray(res?.data)) {
                        return resolve({
                            success: false,
                            message: res.data[0].data,
                        });
                    }
                }
               
                return resolve({
                    success: true,
                    korisnik: res.data
                });
            })
        });
    }

    public static searchKorisnik(data: ISearchKorisnik, role: ApiRole = "sluzbenik"): Promise<IResult> {
        return new Promise<IResult>(resolve => {
            api("post", "/korisnikPretraga", role, data, true)
            .then(res => {
                if(res?.status === "error") {
                    if(Array.isArray(res?.data)) {
                        return resolve({
                            success: false,
                            message: res.data[0].data,
                        });
                    }
                }
               
                return resolve({
                    success: true,
                    korisnik: res.data
                });
            })
        });
    }

    public static setKorisnikSession(data: IKorisnikId, role: ApiRole = "sluzbenik"): Promise<IResult> {
        return new Promise<IResult>(resolve => {
            api("post", "/korisnikSession", role, data, true)
            .then(res => {
                if(res?.status === "error") {
                    if(Array.isArray(res?.data)) {
                        return resolve({
                            success: false,
                            message: res.data[0].data,
                        });
                    }
                }
                
                return resolve({
                    success: true,
                });
            })
        });
    }

    public static editKorisnik(data: IEditKorisnik, role: ApiRole = "sluzbenik"): Promise<IResult> {
        return new Promise<IResult>(resolve => {
            api("post", "/izmeniPodatke", role, data, true)
            .then(res => {
                console.log(res);
                if(res?.status === "error") {
                    console.log(res.data.data)
                    if(Array.isArray(res?.data)) {
                        return resolve({
                            success: false,
                            message: res.data[0].data,
                        });
                    }
                }
                
                return resolve({
                    success: true,
                    korisnik: res.data
                });
            })
        });
    }

    public static editKorisnikNeaktivan(data: IEditKorisnik, role: ApiRole = "sluzbenik"): Promise<IResult> {
        return new Promise<IResult>(resolve => {
            api("post", "/editNeaktivan", role, data, true)
            .then(res => {
                console.log(res);
                if(res?.status === "error") {
                    console.log(res.data.data)
                    if(Array.isArray(res?.data)) {
                        return resolve({
                            success: false,
                            message: res.data[0].data,
                        });
                    }
                }
                
                return resolve({
                    success: true,
                    korisnik: res.data
                });
            })
        });
    }

    public static obrisiKorisnika(role: ApiRole = "sluzbenik"): Promise<IResult> {
        return new Promise<IResult>(resolve => {
            api("get", "/obrisiKorisnika", role, null, true)
            .then(res => {
                if(res?.status === "error") {
                    if(Array.isArray(res?.data)) {
                        return resolve({
                            success: false,
                            message: res.data[0].data,
                        });
                    }
                }
                
                return resolve({
                    success: true,
                    
                });
            })
        });
    }
}