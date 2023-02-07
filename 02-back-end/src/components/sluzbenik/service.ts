import * as mysql2 from 'mysql2/promise';
import SluzbenikModel from './model';
import BaseService from '../../../common/BaseService';
import IErrorResponse from '../../../common/IErrorResponse.interface';

export default class SluzbenikService extends BaseService<SluzbenikModel> {
    
    protected async adaptModel(row: any) {
        const item = new SluzbenikModel();

        item.sluzbenik_id = +(row?.sluzbenik_id);
        item.ime = row?.ime;
        item. prezime = row?.prezime;
        item.username = row?.username;
        item.password_hash = row?.password_hash;
        item.email = row?.email;
        item.br_telefona_sluzbeni = row?.br_telefona_sluzbeni;

        return item;
    }

    public async getById(id: number): Promise<SluzbenikModel | null | IErrorResponse> {
        return await this.getByIdFromTable(
            id,
            "sluzbenik"
        )
    }

    public async getByUsername(username: string): Promise<SluzbenikModel | IErrorResponse | null> {
        return await this.getByFieldName(
            "sluzbenik",
            "username",
            username
        )
    }

    public async getByPassword(password: string, id: number): Promise<SluzbenikModel | null> {
        const sql = `SELECT
                        *
                    FROM
                        sluzbenik
                    WHERE
                        password_hash = ? AND sluzbenik_id = ?`
        const [rows] = await this.db.execute(sql, [password, id]);
        
        if(!Array.isArray(rows) || rows.length === 0) {
            return null;
        }

        return await this.adaptModel(rows[0]);
    }

    public async editSifra(id: number, sifra: string): Promise<SluzbenikModel | IErrorResponse> {
        return new Promise<SluzbenikModel | IErrorResponse>(async reslove => {
            const sql = `UPDATE
                            sluzbenik
                        SET
                            password_hash = ?
                        WHERE
                            sluzbenik_id = ?`
            await this.db.execute(sql, [sifra, id])
            .then(async res => {
                reslove(await this.getById(id));
            })
            .catch(err => {
                reslove({
                    errorCode: err?.errno,
                    errorMessage: err?.sqlMessage
                })   
            })                
        })
    }
}