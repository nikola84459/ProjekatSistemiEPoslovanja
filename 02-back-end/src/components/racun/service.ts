import * as mysql2 from 'mysql2/promise';
import IErrorResponse from '../../../common/IErrorResponse.interface';
import RacunModel, { RacunValuta } from './model';
import ValutaService from '../valuta/service';
import IModelAdapterOptions from '../../../common/IModelAdapterOptions.interface';
import BaseService from '../../../common/BaseService';

class RacunModelAdapterOptions implements IModelAdapterOptions {
    loadValuta = false;
}

class RacunService extends BaseService<RacunModel> {
   
    protected async adaptModel (
        row: any,
        options: Partial<RacunModelAdapterOptions> = {}
     ): Promise<RacunModel> 
     {
        const item: RacunModel = new RacunModel();  

        item.racun_id = +(row?.racun_id);
        item.br_racuna = row?.br_racuna;
        item.tip = row?.tip;
        item.korisnik_id = +(row?.korisnik_id);
        item.is_aktivan = +(row?.is_aktivan);

        if(options.loadValuta) {
            item.racun_valuta = await this.getByRacunValuta(item.racun_id);
                        
        }

        return item;

    }

    public async getAll(options: Partial<RacunModelAdapterOptions> = {}): Promise<RacunModel[] | IErrorResponse> {
        return await this.getAllFromTable(
            "racun",
            options
        )
    }
   
    public async getById(id: number, options: Partial<RacunModelAdapterOptions> = {}): Promise<RacunModel | null | IErrorResponse> {
        return await this.getByIdFromTable(
            id,
            "racun",
            options
        )       
    }

    public async getByKorisnikId(korisnikId: number, options: Partial<RacunModelAdapterOptions> = {}): Promise<RacunModel[]|null> {
        const racuni: RacunModel[] = [];
        const sql: string = `SELECT 
                                racun_id,
                                br_racuna,
                                tip,
                                racun.is_aktivan
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
                        row,
                        options
                     )
                 )
             }
         }
         
         return racuni;
    }

    public async getByRacunValuta(racunId: number): Promise<RacunValuta[]> {
        const sql: string = `SELECT
                                *
                            FROM
                                racun_valuta

                            INNER JOIN valuta on racun_valuta.valuta_id = valuta.valuta_id   

                            WHERE
                                racun_valuta.racun_id = ?`
        const [ rows ] = await this.db.execute(sql, [racunId]);
        if(Array.isArray(rows)) {
            return rows.map(row => {
                return {    
                    racun_valuta_id: row?.racun_valuta_id,
                    racun_id: row?.racun_id,
                    valuta_id: row?.valuta_id,
                    valutaa: {
                        valuta_id: row?.valuta_id,
                        naziv: row?.naziv,
                        sifra: row?.sifra,
                        srednji_kurs: +(row?.srednji_kurs),
                        kupovni_kurs: +(row?.kupovni_kurs),
                        prodajni_kurs: +(row.prodajni_kurs)
                    },
                    stanje: row?.stanje
                }    
            })
        
        }
    }
  
    public async getByRacunNumber(brRacuna: string, options: Partial<RacunModelAdapterOptions> = {}): Promise<RacunModel | null | IErrorResponse> {
        return await this.getByFieldName(
            "racun",
            "br_racuna",
            brRacuna,
            options
        )
    }   
        
    public async editStanje(stanje: number, valuta_id: number, racunId: number) {
        const sql = `UPDATE
                        racun_valuta
                    SET
                        stanje = ?
                    WHERE
                        racun_valuta.racun_id = ? AND racun_valuta.valuta_id = ?`
        return this.db.execute(sql, [stanje, racunId, valuta_id])                
    }

    public async add(brRacuna: string, tip: string, korisnik_id: number, valuta: any, svrha: string): Promise<RacunModel | IErrorResponse> {
        return new Promise<RacunModel | IErrorResponse>(async reslove => {
            this.db.beginTransaction()
            .then(async () => {
                const sql = `INSERT
                                racun
                            SET
                                br_racuna = ?,
                                tip = ?,
                                korisnik_id = ?,
                                svrha = ?,
                                is_aktivan = ?`                                 
                this.db.execute(sql, [brRacuna, tip, korisnik_id, svrha, 0])
                               
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

                        reslove(await this.getById(racunId, {}));
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

    public async deleteRacun(racunId: number): Promise<RacunModel | IErrorResponse> {
        return new Promise<RacunModel | IErrorResponse>(async reslove => {
            const obecanje = [];

           const sql1 = "DELETE FROM racun_valuta WHERE racun_id = ?";
           obecanje.push(this.db.execute(sql1, [racunId]))
          
           const sql2 = "DELETE FROM racun WHERE racun_id = ?"
           obecanje.push(this.db.execute(sql2, [racunId]));

           Promise.all(obecanje)
           .then(async () => {
                this.db.commit(); 
           })
           .catch(async err => {
                reslove({
                    errorCode: err?.errno,
                    errorMessage: err?.sqlMessage
            })    
           })
               
        })
}

    public async editIsAktivan(racunId: number, isAktivan: number) {
        const sql = `UPDATE 
                        racun
                    SET
                        is_aktivan = ?
                    WHERE 
                        racun_id = ?`
        this.db.execute(sql, [isAktivan,racunId])                
    }
}

export default RacunService;