import * as mysql2 from 'mysql2/promise';
import IErrorResponse from '../../common/IErrorResponse.interface';
import KorisnikModel from './model';


class KorisnikService {
    private db: mysql2.Connection;
    
    constructor(db: mysql2.Connection) {
        this.db = db;
    }

    protected async adaptModel (
        row: any,
        //options: Partial<IModelAdapterOptions> = {}
     ): Promise<KorisnikModel> 
    {
      const item = new KorisnikModel();

      item.korisnik_id = +(row?.korisnik_id);
      item.ime = row?.ime;
      item.prezime = row?.prezime;
      item.username = row?.username;
      item.password_hash = row?.password_hash;
      item.jmbg = row?.jmbg;
      item.is_aktivan = row?.is_aktivan;
      item.br_licne_karte = row?.br_licne_karte;

      return item;
    }
    
    public async getById(id: number): Promise <KorisnikModel | null> {
        const sql = `SELECT	
                        *
                    FROM
                        korisnik
                    WHERE
                        korisnik_id = ?`;
        const [rows] = await this.db.execute(sql, [id]);
        
        if (!Array.isArray(rows) || rows.length === 0) {
            return null;
        }

        return await this.adaptModel(rows[0]);
    }

    public async getByUsername(username: string) {
        const sql = `SELECT	
                        *
                    FROM
                        korisnik
                    WHERE
                        username = ?` 
        const [rows] = await this.db.execute(sql, [username]);
        
        if(!Array.isArray(rows) || rows.length === 0) {
            return null;
        }

        return await this.adaptModel(rows[0]);
    }

    public async getByPassword(password: string, id: number): Promise<KorisnikModel> {
        const sql = `SELECT
                        *
                    FROM
                        korisnik
                    WHERE
                        password_hash = ? AND korisnik_id = ?`
        const [rows] = await this.db.execute(sql, [password, id]);
        
        if(!Array.isArray(rows) || rows.length === 0) {
            return null;
        }

        return await this.adaptModel(rows[0]);
    }

    public async updatePassword(id: number, password: string): Promise<KorisnikModel | IErrorResponse> {
       // const podaci = this.getById(id);

       // if(podaci === null) {
         //   return null;
       // }
        
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

    public async add(ime: string, prezime: string, password_hash: string, jmbg: string, brLicneKarte: string): Promise<KorisnikModel | IErrorResponse> {
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
                            br_licne_karte = ?`
            
            this.db.execute(sql, [ime, prezime, jmbg, password_hash, jmbg, 0 ,brLicneKarte])
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
}

export default KorisnikService;