import * as mysql2 from 'mysql2/promise';
import IErrorResponse from '../../common/IErrorResponse.interface';
import RacunModel from './model';

class RacunService {
    private db: mysql2.Connection;
   
    constructor(db: mysql2.Connection) {
        this.db = db;
    }

    protected async adaptModel (
        row: any,
        //options: Partial<IModelAdapterOptions> = {}
     ): Promise<RacunModel> 
     {
      const item: RacunModel = new RacunModel();  

      item.racun_id = +(row?.racun_id);
      item.br_racuna = row?.br_racuna;
      item.tip = row?.tip;
      item.korisnik_id = row?.korisnik_id

          
      return item;

    }

    public async getAll(): Promise<RacunModel[]> {
        const racuni: RacunModel[] = [];
        const sql: string = "SELECT * FROM racun";
        const [rows, columns] = await this.db.execute(sql);
       
        if(Array.isArray(rows)) {
           for(const row of rows) {
                racuni.push (
                    await this.adaptModel (
                        row
                    )
                )
            }
        }

        return racuni;
    }
   
    public async getById(id: number): Promise<RacunModel|null> {
        const sql: string = "SELECT * FROM racun WHERE racun_id = ?";
        const [rows, columns] = await this.db.execute(sql, [id]);
        
        if(!Array.isArray(rows)) {
            return null;
        }
       
        if(rows.length === 0) {
            return null;
       }
               
        return await this.adaptModel(rows[0])
         
    }

    public async getByKorisnikId(korisnikId: number): Promise<RacunModel[]|null> {
        const racuni: RacunModel[] = [];
        const sql: string = `SELECT 
                                racun_id,
                                br_racuna,
                                tip,
                                valuta_id,
                                stanje 
                            FROM 
                                racun
        
                            INNER JOIN korisnik ON racun.korisnik_id = korisnik.korisnik_id
    
                            WHERE 
                                korisnik.korisnik_id = ?`;
        const [rows, columns] = await this.db.execute(sql, [korisnikId])

        if(Array.isArray(rows) && rows.length === 0) {
            return null;
        }       
                  
        if(Array.isArray(rows)) {
            for(const row of rows) {
                 racuni.push (
                     await this.adaptModel (
                        row
                     )
                 )
             }
         }
         
         return racuni;
    }

      
    public async getByRacunNumber(brRacuna: string): Promise<RacunModel|null> {
        const sql: string = `SELECT 
                                * 
                            FROM 
                                racun 
                            WHERE 
                                racun.br_racuna = ?`
        const [rows] = await this.db.execute(sql, [brRacuna])
        
        if(!Array.isArray(rows)) {
            return null;
        }

        if(Array.isArray(rows) && rows.length === 0) {
            return null;
        }
        
        return this.adaptModel(rows[0]);        
    }
        
    public async edit(stanje: number, valuta_id: number ,racunId: number) {
        const sql = `UPDATE
                        racun_valuta
                    SET
                        stanje = ?
                    WHERE
                        racun_valuta.racun_id = ? AND racun_valuta.valuta_id = ?`
        this.db.execute(sql, [stanje, racunId, valuta_id])                
    }

    public async add(brRacuna: string, tip: string, korisnik_id: number, valuta: any): Promise<RacunModel | IErrorResponse> {
        return new Promise<RacunModel | IErrorResponse>(async reslove => {
            this.db.beginTransaction()
            .then(async () => {
                const sql = `INSERT
                                racun
                            SET
                                br_racuna = ?,
                                tip = ?,
                                korisnik_id = ?`
                this.db.execute(sql, [brRacuna, tip, korisnik_id])
                               
                .then(async (result: any) => {
                    const racunId = result[0].insertId
                    const obecanje = []
                    
                    for(const i of valuta) {
                        const sql1 = `INSERT
                                        racun_valuta
                                    SET
                                        racun_id = ?,
                                        valuta_id = ?,
                                        stanje = ?`
                        obecanje.push(this.db.execute(sql1, [racunId, i, 0]));                
                    }

                    Promise.all(obecanje)
                    .then(async () => {
                        this.db.commit();

                        reslove(await this.getById(racunId));
                    })
                    .catch (async error => {
                        this.db.rollback();
                        reslove({
                            errorCode: error?.errno,
                            errorMessage: error?.sqlMessage
                        })   
                    }); 
                })
                .catch (async error => {
                    this.db.rollback();
                    reslove({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    })   
                }); 
            })                  
        }) 
    }

    public async getLastData() {
        const sql = `SELECT
                        *
                    FROM
                        racun
                    ORDER BY
                        racun_id
                    DESC LIMIT 1`;
        const [ rows ] = await this.db.execute(sql);
        
        return this.adaptModel(rows[0]);
    }
}

export default RacunService;