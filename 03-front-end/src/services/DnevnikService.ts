import { ApiRole } from '../Api/api';
import api from '../Api/api';

interface IAddAktivnost {
    stranica: string;
    radnja: string;
    ipAdresa: string;
    grad: string;
    drzava: string
}

interface IResult {
    success: boolean;
    message?: string;
}   

export default class DnevnikService {
    public static addAktivnost(data: IAddAktivnost, role: ApiRole): Promise<IResult> {
        return new Promise<IResult>(resolve => {
            api("post", "/addAkitvnost", role, data)
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