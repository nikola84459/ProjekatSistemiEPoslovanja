import * as mysql2 from 'mysql2/promise';
import BaseService from '../../../common/BaseService';
import IErrorResponse from '../../../common/IErrorResponse.interface';
import KorisnikModel from './model';


export default class KorisnikService extends BaseService<KorisnikModel> {
  
    protected async adaptModel (row: any): Promise<KorisnikModel>{
      const item = new KorisnikModel();

      item.korisnik_id = +(row?.korisnik_id);
      item.ime = row?.ime;
      item.prezime = row?.prezime;
      item.username = row?.username;
      item.password_hash = row?.password_hash;
      item.jmbg = row?.jmbg;
      item.is_aktivan = row?.is_aktivan;
      item.br_licne_karte = row?.br_licne_karte;
      item.br_telefon = row?.br_telefona;
      item.adresa = row?.adresa;
      item.email = row?.email

      return item;
    }
    
    public async getById(id: number): Promise <KorisnikModel | null | IErrorResponse> {
        return await this.getByIdFromTable(
            id,
            "korisnik"
        )
    }
        

    public async getByUsername(username: string): Promise<KorisnikModel | null | IErrorResponse> {
        return await this.getByFieldName(
            "korisnik",
            "username",
            username
        )
    }

    public async getByPassword(password: string, id: number): Promise<KorisnikModel | IErrorResponse | null> {
        return new Promise<KorisnikModel | IErrorResponse | null>(async reslove => {
            const sql = `SELECT
                            *
                        FROM
                            korisnik
                        WHERE
                            password_hash = ? AND korisnik_id = ?`
            const [ rows, columns ] = await this.db.execute(sql, [password, id]);
        
            if(!Array.isArray(rows)) {
                reslove(null);
                return;
            }

            if(rows.length === 0) {
                reslove(null);
                return;
            }

            return await this.adaptModel(rows[0]);   
        })
        
    }

    public async updatePassword(id: number, password: string): Promise<KorisnikModel | IErrorResponse> {
        return new Promise <KorisnikModel | IErrorResponse> (async reslove => {
            const sql = `UPDATE
                            korisnik
                        SET
                            password_hash = ? 
                        WHERE
                            korisnik_id = ?`
            this.db.execute(sql, [password, id])
                .then(async result => {
                    reslove(await this.getById(id));
                })
                .catch (async error => {
                    reslove({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    })   
                    
                });           
        });
    }

    public async add(ime: string, prezime: string, password_hash: string, jmbg: string, brTelefona: string ,brLicneKarte: string, adresa: string, email: string): Promise<KorisnikModel | IErrorResponse> {
        return new Promise<KorisnikModel | IErrorResponse>(async reslove => {
            const sql = `INSERT
                            korisnik
                        SET
                            ime = ?,
                            prezime = ?,
                            username = ?,
                            password_hash = ?,
                            jmbg = ?,
                            is_aktivan = ?,
                            br_telefona = ?, 
                            br_licne_karte = ?,
                            adresa = ?,
                            email = ?`
            
            this.db.execute(sql, [ime, prezime, jmbg, password_hash, jmbg, 0, brTelefona ,brLicneKarte, adresa, email])
            .then(async (result: any) => {
                reslove(await this.getById(result[0].insertId));
            })
            .catch (async error => {
                reslove({
                    errorCode: error?.errno,
                    errorMessage: error?.sqlMessage
                })   
                
            });                  
        });
    }

    public async pretragaByImeIprezime(ime: string, prezime: string): Promise <KorisnikModel[] | null> {
        const korisnici: KorisnikModel[] = [];
        const sql = `SELECT
                        korisnik_id,
                        ime,
                        prezime,
                        jmbg,
                        br_licne_karte
                    FROM
                        korisnik
                    WHERE
                        ime = ? AND prezime = ?`
        const [ rows ] = await this.db.execute(sql, [ime, prezime]);

        if(!Array.isArray(rows) || rows.length === 0) {
            return null
        }

        if(Array.isArray) {
            for(const row of rows) {
                korisnici.push(await this.adaptModel(
                        row
                ))
            }

        }
        
        return korisnici
        
    }

    public async pretragaByJmbgAndBrLk(jmbg: string, brLk: string): Promise<KorisnikModel | null> {
        const sql = `SELECT 
                        korisnik_id,
                        ime,
                        prezime,
                        jmbg,
                        br_licne_karte,
                        br_telefona
                    FROM
                        korisnik
                    WHERE
                        jmbg = ? OR br_licne_karte = ?`
        const [ rows ] = await this.db.execute(sql, [jmbg, brLk]);
        
        if(!Array.isArray(rows) || rows.length === 0) {
            return null
        }

        return this.adaptModel(rows[0]);

    }

    public async edit(ime: string, prezime: string, brTelefona: string, brLicneKarte: string, adresa: string, korisnikdId: number): Promise<KorisnikModel | IErrorResponse> {
        return new Promise<KorisnikModel | IErrorResponse>(reslove => {
            const sql = `UPDATE 
                            korisnik
                        SET
                            ime = ?,
                            prezime = ?,
                            br_telefona = ?,
                            br_licne_karte = ?,
                            adresa = ?
                        WHERE
                            korisnik_id = ?`
            this.db.execute(sql, [ime, prezime, brTelefona, brLicneKarte, adresa, korisnikdId])
            .then(async res => {
                reslove(await this.getById(korisnikdId))
            })
            .catch(error => {
                reslove({
                    errorCode: error?.errno,
                    errorMessage: error?.sqlMessage
                });      
            });            
        });
    }

    public async editIsAktivan(korisnikId: number): Promise<KorisnikModel | IErrorResponse> {
        return new Promise<KorisnikModel | IErrorResponse>(reslove => {
            const sql = `UPDATE 
                            korisnik
                        SET
                            is_aktivan = 0
                        WHERE
                            korisnik_id = ?`
            this.db.execute(sql, [korisnikId])
            .then(async res => {
                reslove(this.getById(korisnikId));
            })
            .catch(error => {
                reslove({
                    errorCode: error?.errno,
                    errorMessage: error?.sqlMessage
                });      
            });            
        });
    }
}