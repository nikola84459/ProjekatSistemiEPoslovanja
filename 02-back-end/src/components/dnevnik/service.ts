import * as mysql2 from 'mysql2/promise';
import DnevnikModel from './model';
import IErrorResponse from '../../../common/IErrorResponse.interface';
import BaseService from '../../../common/BaseService';

export default class DnevnikService extends BaseService<DnevnikModel> {
    
    protected async adaptModel(row: any) {
        const item = new DnevnikModel();

        item.dnevnik_id = +(row?.dnevnik_id);
        item.radnja = row?.radnja;
        item.datum_i_vreme = row?.datum_i_vreme;
        item.korisnik_id = +(row?.korisnik_id);
        item.sluzbenik_id = +(row?.sluzbenik_id);
        item.ip_adresa = row.ip_adresa;
        item.grad = row?.grad;
        item.drzava = row?.drzava

        return item;
    }

    public async getById(dnevnikId): Promise<DnevnikModel | IErrorResponse> {
        return await this.getByIdFromTable(
            dnevnikId,
            "dnevnik",
        )
    }
    
    public async add(stranica: string,radnja: string, datumIVreme: string, korisnikId: number | null, sluzbenikId: number | null, ipAdresa: string, grad: string, drzava: string): Promise<DnevnikModel | IErrorResponse> {
        return new Promise<DnevnikModel | IErrorResponse>(reslove => {
            const sql = `INSERT
                            dnevnik
                        SET
                            stranica = ?,
                            radnja = ?,
                            datum_i_vreme = ?,
                            korisnik_id = ?,
                            sluzbenik_id = ?,
                            ip_adresa = ?,
                            grad = ?,
                            drzava = ?`
            this.db.execute(sql, [stranica, radnja, datumIVreme, korisnikId, sluzbenikId, ipAdresa, grad, drzava])
            .then(async (res: any) => {
                reslove(await this.getById(res[0]?.insertId))
            }) 
            .catch(err => {
                console.log(err);
                reslove({
                    errorCode: err?.errno,
                    errorMessage: err?.sqlMessage
                });
            })               
        })
    }
}