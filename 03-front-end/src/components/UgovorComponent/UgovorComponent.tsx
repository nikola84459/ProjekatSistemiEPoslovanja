import BasePage, { BasePageProperties } from "../BasePage/BasePage";
import "./ugovorComponent.css"

class UgovorComponentProperties extends BasePageProperties {
    brRacuna: string;
    tip: string;
    jmbg: string | undefined;
    ime: string | undefined;
    prezime: string | undefined;
    brLk: string | undefined;
}


class UgovorComponentState {
    brRacuna: string;
    tip: string;
    jmbg: string;
    ime: string;
    prezime: string;
    brLk: string;
}


export default class UgovorComponent extends BasePage<UgovorComponentProperties> {
    state: UgovorComponentState;
        
    constructor(props: any) {
        super(props);
        
        this.state = {
            brRacuna: "",
            tip: "",
            jmbg: "",
            ime: "",
            prezime: "",
            brLk: ""
        }
    } 
    
    private setData() {
                
        this.setState({
            brRacuna: this.props.brRacuna,
            tip: this.props.tip,
            jmbg: this.props.jmbg,
            ime: this.props.ime,
            prezime: this.props.prezime,
            brLk: this.props.brLk
        })
             
    }

    componentDidMount() {
        this.setData();
    }
    
       renderMain(): JSX.Element {
        return (
        <>
            <h3 className="naslov">Ugovor za {this.state.tip} račun, broj {this.state.brRacuna}</h3>
            <div className="kontent">
                <p>Zaključen u Beogradu dana {String(new Date())} između: </p>
                <div>
                    <p><b>1: {this.state.ime} {this.state.prezime} matični broj: {this.state.jmbg} broj ličnog dokumenta: {this.state.brLk} (u daljem tekstu klijent) i</b></p>
                    <p><b>2. Banka a.d. Beograd, Đorđa Stanojevića 16, matični broj 17335600, PIB 100000299, koju zastupaju
                        Zoran Petrović, predsednik Izvršnog odbora i Petar Jovanović, član Izvršnog odbora (u daljem tekstu: Banka)</b></p>

                    <div>
                        <p>
                        Ugovorne stane zaključuju ovaj ugovor u skladu sa Zakonom
                        o zaštiti korisnika finansijskih usluga kod ugovaranja na
                        daljinu, Zakonom o platnim uslugama i drugim propisima koji
                        uređuju materiju koja je predmet ovog ugovora
                        </p>
                        <p className="clan">
                            <b>Član 1</b>
                        </p>
                        <p>
                        Potpisom ovog Ugovora o dinarskom tekućem
                        računu Klijent i Banka zaključuju Okvirni ugovor u skladu sa
Zakonom o platnim uslugama koji čine:
 Ugovor o dinarskom tekućem računu
Opšti uslovi poslovanja Raiffeisen banke a.d. Beograd koji
se primenjuju na pružanje platnih usluga fizičkim licima (u
daljem tekstu: Opšti uslovi poslovanja) i
 Tarifa naknada za usluge platnog prometa fizičkim licima
kao sastavni deo Opštih uslova poslovanja (u daljem
tekstu:Tarifa).
Potpisom ovog ugovora o dinarskom tekućem računu Klijent
potvrđuje da je Opšte uslove poslovanja i Tarifu primio od
Banke u predugovornoj fazi putem elektronske pošte.
Klijent je u predugovornoj fazi upoznat o sledećem:
Ovaj ugovor o dinarskom tekućem računu Klijent potpisuje
naprednim elektronskim potpisom (koji podrazumeva
najmanje dva elementa za potvrđivanje identiteta Klijenta),
a Banka kvalifikovanim elektronskim potpisom.
Napredni elektronski potpis Klijenta je na nedvosmislen način
povezan sa Klijentom kroz odgovarajuću autentifikaciju
korišćenjem video - identifikacije, koja predstavlja prvi
element na osnovu čega je određen identitet Klijenta.
U procesu ugovaranja uz saglasnost Klijenta, Banka Klijentu
izdaje nekvalifikovani elektronski sertifikat (kao elektronsku
potvrdu kojom se potvrđuje veza između podataka za
proveru elektronskog potpisa i identiteta potpisnika) koji je
smešten na trajnom nosaču u zaštićenom okruženju Banke u
elektronskoj formi. Korišćenje elektronskog sertifikata
Klijenta je moguće samo pomoću tajnog ključa (sastoji se od
niza brojeva / slova koji su jednoznačno povezani sa
elektronskim sertifikatom Klijenta) koji se Klijentu dostavlja
kroz SMS poruku na prethodno registrovani broj mobilnog
telefona, što predstavlja drugi element za potvrđivanje
identiteta Klijenta.
Elektronski sertifikat Klijenta je vremenski ograničen i ima
jednokratnu primenu za potpisivanje ovog ugovora o
dinarskom tekućem računu, koji se zaključuje na daljinu.
Napredni elektronski potpis je izvršen potvrdom tajnog
ključa sertifikata Klijenta, čime se garantuje da je napredni
elektronski potpis pod isključivom kontrolom Klijenta kao i da
su korišćena mininalno dva elementa za identifikaciju
Klijenta (dvofaktorska autentifikacija).
Upotrebom međunarodnog standarda za kreiranje
elektonskog dokumenta u PDF formatu ovog ugovora o
dinarskom tekućem računu odnosno Okvirnog ugovora,
korišćenjem standarda za napredni elektronski potpis PaDES
LTV (TS 102 778)1 i primenom kvalifikovanog vremenskog žiga
garantuje se autentičnost ovog ugovora o dinarskom
tekućem računu odnosano Okvirnog ugovora, tačno vreme
elektronskog potpisa i nemogućnost naknadnih izmena.

                        </p>
                        <p className="clan">
                            <b>Član 2</b>

                        </p>
                        <p>
                        Na osnovu ovog ugovora o dinarskom tekućem
računu i Opštih uslova poslovanja, Banka Klijentu otvara
dinarski tekući račun broj 265-0000006185195-37 (u daljem
tekstu: iRačun).
iRačun služi za prijem uplata i vršenje plaćanja u dinarima, a
na način i pod uslovima utvrđenim ovim ugovorom o
dinarskom tekućem računu, Opštim uslovima poslovanja i
Tarifom.
Potpisom ovog ugovora o dinarskom tekućem računu Klijent
potvrđuje da mu je Banka uručila Opšte uslove poslovanja sa
Tarifom.
Na sredstva na iRačunu Banka ne obračunava i ne plaća
kamatu.
Na iznos nedozvoljenog prekoračenja Banka obračunava i
Klijentu naplaćuje zakonsku zateznu kamatu.
                        </p>
                        <p className="clan">
                            <b>Član 3</b>
                        </p>
                        <p>
                        Klijent se obavezuje:
 da, pri obavljanju platnih transakcija, iRačun koristi samo
do iznosa pozitivnog salda na istom. Ukoliko je iRačun u
2
nedozvoljenom prekoračenju Banka ima pravo da
jednostrano raskine ugovor bez otkaznog roka;
 da se prilikom obavljanja platnih transakcija, izdavanja
platnih naloga, korišćenja platnih instrumenata, odnosno
prilikom korišćenja platnih usluga kod Banke, pridržava
odredaba Okvirnog ugovora, Zakona o platnim uslugama i
drugih propisa koji uređuju platne usluge ili su u vezi sa njima.
Klijent je saglasan da Banka sve podatke iz ovog ugovora o
dinarskom tekućem računu, uključujući i podatke o ličnosti
Klijenta, kao i sve podatke do kojih dodje u toku međusobne
poslovne saradnje, evidentira i obrađuje u skladu sa
zakonom, kao i da iste može proslediti u Kreditni biro,
Centralni registar NBS i centralnu bazu podataka Raiffeisen
grupe u zemlji i inostranstvu, povezanim licima sa Bankom,
drugim licima koji zbog prirode posla koji obavljaju moraju
imati pristup takvim podacima, trećim licima u svrhu naplate
duga, kao i trećim licima sa kojima je Banka u poslovnom
odnosu ukoliko se za to ukaže potreba u cilju realizacije
prava i obaveza iz ugovora.

                        </p>
                    </div>    
                </div>
            </div>
            
        </>
        )
    }
}

