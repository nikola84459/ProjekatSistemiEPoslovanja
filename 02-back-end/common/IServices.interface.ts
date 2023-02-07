import RacunService from '../src/components/racun/service';
import KorisnikService from '../src/components/korisnik/service';
import TransakcijaService from '../src/components/transakcija/service';
import ValutaService from '../src/components/valuta/service';
import SluzbenikService from '../src/components/sluzbenik/service';
import DnevnikService from '../src/components/dnevnik/service';

export default interface IServices {
    racunService: RacunService
    korisnikService: KorisnikService;
    transakcijaService: TransakcijaService;
    valutaService: ValutaService;
    sluzbenikService: SluzbenikService;
    dnevnikService: DnevnikService;
}