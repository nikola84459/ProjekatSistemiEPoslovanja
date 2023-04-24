import axios from 'axios';
import DnevnikService from '../services/DnevnikService';
import { ApiRole, saveAuthToken, saveRefreshToken } from '../Api/api';
import { resolve } from 'path';

export default async function getLocationAndIp() {
    return await axios.get('https://geolocation-db.com/json/');
    
}

export function addAktivnost(stranica: string, radnja: string, role: ApiRole): Promise<void> {
    return new Promise<void>(reslove => {
        getLocationAndIp()
        .then((res: any) => {
            DnevnikService.addAktivnost({
                stranica: stranica,
                radnja: radnja,
                ipAdresa: res.data.IPv4,
                grad: res.data.city,
                drzava: res.data.country_name
            }, role)
            
            reslove();
        })    
    })
}