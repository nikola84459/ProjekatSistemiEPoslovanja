import BasePage, { BasePageProperties } from '../BasePage/BasePage';
import KorisnikModel from '../../../../03-back-end/src/components/korisnik/model';
import { Card, Button, Container, Table, Modal, ModalBody, Spinner, Alert } from 'react-bootstrap';
import KorisnikService from '../../services/KorisnikService';
import "./podaciKorisnikSluzbenik.css"
import RacunModel from '../../../../03-back-end/src/components/racun/model';
import RacunService from '../../services/RacunService';
import { Link, Redirect } from 'react-router-dom';
import { isUlogaUlogovana } from "../../Api/api";
import EventRegister from '../../Api/EventRegister';
import getLocationAndIp from '../../Dnevnik/Dnevnik';
import DnevnikService from '../../services/DnevnikService';
import { addAktivnost } from '../../Dnevnik/Dnevnik';
import NaslovComponent from '../NaslovComponent/NaslovComponent';
import TransakcijaService from '../../services/TransakcijaService';
import KorisnikPodaciPage from '../KorisnikPodaciPage/KorisnikPodaciPage';


class PodaciKorisnikSluzbenikComponentState {
    korisnik: KorisnikModel | null;
    racun: RacunModel[] | null;
    show: boolean
    isObrisan: boolean;
    showRacun: boolean;
    racunId: number | null;
    isUlogovan: boolean | null;
    isGreskaKorisnik: boolean;
    isGreskaRacun: boolean;
    prikazZatvaranje: boolean;
    podaciOZatvaranu: any;
    prikazBrisanje: boolean;
    showPoslednji: boolean;
    isZatvorio: boolean;
    isUProcesu: boolean;
}

export default class PodaciKorisnikSluzbenikComponent extends BasePage<{}> {
    state: PodaciKorisnikSluzbenikComponentState;

    constructor(props: any) {
        super(props);

        this.state = {
            korisnik: null,
            racun: null,
            show: false,
            isObrisan: false,
            showRacun: false,
            racunId: null,
            isUlogovan: null,
            isGreskaKorisnik: false,
            isGreskaRacun: false,
            prikazZatvaranje: false,
            podaciOZatvaranu: null,
            prikazBrisanje: false,
            showPoslednji: false,
            isZatvorio: false,
            isUProcesu: false
        }
    }
    
    
    private getKorisnik() {
        KorisnikService.getKorisnikSluzbenik()
        .then(res => {
            this.setState({
                korisnik: res
            });

            this.getRacun();
        })
       
    }

    private getRacun() {
        RacunService.getByKorisnikIdSluzbenik()
        .then(res => {
            this.setState({
                racun: res
            })
        });
    }
    

    componentDidMount(): void {
        isUlogaUlogovana("sluzbenik")
        .then(res => {
            if(!res) {
                EventRegister.emit("AUTH_EVENT", "force_login")
                this.setState({
                    isUlogovan: false
                })
                return;
            } else {
                this.setState({
                    isUlogovan: true
                })
                this.getKorisnik();
                addAktivnost(window.location.href, "Službenik pristupio podacima korisnika", "sluzbenik");
            }
        })
                          
    }

    componentWillUnmount(): void {
        addAktivnost(window.location.href, "Službenik zatvorio stranicu sa podacima korisnika.", "sluzbenik");    
    }

    renderMain(): JSX.Element {
        if(this.state.isUlogovan === false) {
            return <Redirect to={"/security/prijavaSluzbenik"} />
        }
        
        return (
            <Container>
              
                <Card className="podaci">
                    <Card.Header as="h5">PODACI O KORISNIKU</Card.Header>
                    <Card.Body>
                        {
                            this.state.isObrisan ? (
                                <Card.Title className='boja'>USPEŠNO STE OBRISALI KORISNIKA</Card.Title>
                        ): ""}    
                        <Table striped bordered hover size="sm">
                        
                            <tr>
                                <th>Ime</th>
                                <td>{this.state.korisnik?.ime}</td>
                            </tr>
                            <tr>
                                <th>Prezime</th>
                                <td>{this.state.korisnik?.prezime}</td>
                            </tr>
                            <tr>
                                <th>JMBG</th>
                                <td>{this.state.korisnik?.jmbg}</td>
                            </tr>
                            <tr>
                                <th>Broj lične karte </th>
                                <td>{this.state.korisnik?.br_licne_karte}</td>
                            </tr>
                            <tr>
                                <th>Adresa prebivališta</th>
                                <td>{this.state.korisnik?.ulica_prebivalista} {this.state.korisnik?.broj_prebivalista}, {this.state.korisnik?.mesto_prebivalista}</td>
                            </tr>
                            <tr>
                                <th>Broj telefona</th>
                                <td>{this.state.korisnik?.br_telefon}</td>
                            </tr>
                            <tr>
                                <th>E-mail</th>
                                <td>{this.state.korisnik?.email}</td>
                            </tr>
                            <tr>
                                <th>Aktivan/neaktivan</th>
                                {
                                    this.state.korisnik?.is_aktivan === 1 ? (
                                        <td id='aktivan'>Aktivan</td>
                                ):
                                        <td id='neaktivan'>Neaktivan</td>
                                }
                            </tr>
                        
                        </Table>
                        <h5>Računi korisnika</h5>
                        <Alert show={this.state.racun?.length === 0} className="obavestenje"  key="warning" variant="warning">
                            Korisnik nema račune.
                        </Alert>
                        <Table hidden = {this.state.racun?.length === 0}>
                            <thead>
                                <tr>
                                    <th>Broj računa</th>
                                    <th>Tip</th>
                                    <th>Stanje</th>
                                    <th>Status</th>
                                    <th></th>
                                    <th></th>
                                                             
                                </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.racun?.map(ra => (
                                    <tr>
                                        <td>{ra.br_racuna}</td>
                                        <td>{ra.tip}</td>
                                        <td>
                                            {
                                               ra.tip === "dinarski" ? (
                                                    ra.racun_valuta[0].stanje + " RSD"
                                               ):
                                               <Table>
                                                {
                                                    ra.racun_valuta.map(v => (
                                                        <>
                                                        <td>{v.stanje} {v.valutaa.sifra.toLocaleUpperCase()}</td>
                                                        </>
                                                    ))   
                                                }    
                                               </Table>
                                            }
                                        </td>
                                        {   
                                            ra.is_aktivan === 1 ? (
                                                <td>Aktivan</td>
                                            ):
                                                <td>Zatvoren</td>   
                                        }
      
                                        {
                                            ra.is_aktivan === 1 ? (
                                                <><td>
                                                    <Link to={"/isplataNovca/" + ra.racun_id}>
                                                        <Button size="sm" className='isplataDugme' variant='primary'>Isplata novca</Button>
                                                    </Link>
                                                </td>
                                                <td><Button onClick={e => { this.showRacun(e); } } value={ra.racun_id} variant="danger" size="sm">Zatvori račun</Button></td></>
                                            ): 
                                                <><td></td>
                                                <td></td></>
                                        }
                                      
                                           
                                    </tr>
                                    
                                ))    
                            }
                            </tbody>
                        </Table>
                        {
                            this.state.korisnik?.is_aktivan === 1 ? (
                        <>
                        <Link to={"/izmenaPodaciKorisnik"}>
                            <Button variant='primary'>Izmeni podatke</Button>
                        </Link>
                        <Link to={"/dodajRacunPostojeciKorisnik"}>
                            <Button className='otvoriNovi' variant='primary'>Otvori novi račun</Button>
                         </Link>
                            <Button onClick={() => { this.show(); } } className='dugmeObrisi' variant='danger'>Obriši korisnika</Button>
                        
                        </>  
                        ): ""}
                        <Link to={"/pretragaKorisnika"}>
                            <Button className='dugmeZatvori' variant='primary'>Zatvori</Button>
                        </Link>     
                    </Card.Body>
                </Card>

                <Modal show={this.state.show} onHide={() => {this.close(null)}}>
                    <Modal.Header closeButton>
                        <Modal.Title>Brisanje korisnika</Modal.Title>
                    </Modal.Header>
                { !this.state.isGreskaKorisnik ? (
                <>
                <Modal.Body>Da li sigurno želite da obrišete ovog korisnika sa podacima: 
                    <br />
                    <br />
                    Ime: {this.state.korisnik?.ime}
                    <br />
                    Prezime: {this.state.korisnik?.prezime}
                    <br />
                    JMBG: {this.state.korisnik?.jmbg}
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled = {this.state.isUProcesu} variant="primary" value="true" onClick={e => this.close(e)}>
                    <Spinner 
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            hidden = {!this.state.isUProcesu}
                        />
                        {
                        !this.state.isUProcesu ? (
                            "Da"
                        ) :
                            "Molimo sačekajte"
                        }
                    </Button>
                <Button disabled = {this.state.isUProcesu} variant="danger" value="false" onClick={e => {this.close(e)}}>
                    Ne
                </Button>
                </Modal.Footer>
                
                </>
                ):
                !this.state.prikazBrisanje ? ( 
                <>
                <Modal.Body>
                    Ovaj korisnik još uvek ima otvorene računa, kako bi ste obrisali korisnika zatvorite sve račune
                    <br />
                    <br />
                    Da li želite da zatvorite sve račune za korisnika?
                        </Modal.Body>
                        <Modal.Footer>
                                <Button disabled = {this.state.isUProcesu} variant="primary" value="true" onClick={e => { this.zatvoriSveRacune(e); } }>
                                <Spinner 
                                    as="span"
                                    animation="grow"
                                    size="sm"
                                    role="status"
                                    hidden = {!this.state.isUProcesu}
                                />
                        {
                        !this.state.isUProcesu ? (
                            "Potvrdi"
                        ) :
                            "Molimo sačekajte"
                        }
                                                
                                </Button>
                                <Button disabled = {this.state.isUProcesu} variant="danger" value="false" onClick={e => { this.close(e); } }>
                                    Odustani
                 </Button>
                </Modal.Footer>
                </>
                ): 
                    !this.state.isZatvorio ? (
                    <><Modal.Body>
                                Nije moguće zatvoriti sve račune za ovog korisnika s' obzirom da korisnik na pojedinim računama i dalje ima novca. Kako bi ste obrisali korisnika
                                isplatite novac sa računa na kojima još uvek ima novca.
                            </Modal.Body>
                        <Modal.Footer>
                            <Button variant='danger' value="false" onClick={e => { this.close(e) }}>Zatvori</Button>
                        </Modal.Footer></>
                ): 
                    <>
                    <Modal.Body>
                        Uspešno ste zatvorili račune za korisnika
                    </Modal.Body>
                    <Modal.Footer>
                        <Button disabled = {this.state.isUProcesu} variant='primary' value="true" onClick={e => this.close(e)}>
                        <Spinner 
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            hidden = {!this.state.isUProcesu}
                        />
                        {
                        !this.state.isUProcesu ? (
                            "Nastavi sa brisanjem korisnika"
                        ) :
                            "Molimo sačekajte"
                        }
                        </Button>
                    </Modal.Footer>
                    </>
                }
            </Modal> 

             <Modal show={this.state.showRacun} onHide={() => {this.closeRacun(null)}}>
                    <Modal.Header closeButton>
                        <Modal.Title>Zatvaranje računa</Modal.Title>
                    </Modal.Header>
                    {
                        !this.state.isGreskaRacun ? (
                <><Modal.Body>Da li sigurno želite da zatvorite račun broj:
                                <br />
                                {this.state.racun?.map(ra => (
                                    +(this.state.racunId!) === +ra.racun_id ? (
                                        ra.br_racuna
                                    ) : ""

                                ))}

                            </Modal.Body>
                            <>
                                    <Modal.Body>

                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button disabled = {this.state.isUProcesu} variant="primary" value="true" onClick={e => { this.closeRacun(e); } }>
                                        <Spinner 
                                            as="span"
                                            animation="grow"
                                            size="sm"
                                            role="status"
                                            hidden = {!this.state.isUProcesu}
                                        />
                                    {
                                        !this.state.isUProcesu ? (
                                            "Da"
                                    ) :
                                            "Molimo sačekajte"
                        }
                                        </Button>
                                        <Button disabled = {this.state.isUProcesu} variant="danger" value="false" onClick={e => { this.closeRacun(e); } }>
                                            Ne
                                        </Button>
                                    </Modal.Footer>

                                </>
                                </>
                ):
                  !this.state.prikazZatvaranje ? (                      
                   <><Modal.Body>
                                Na ovom računu još uvek ima novca, kako bi ste zatvorili račun morate isplatiti sav novac sa računa.
                                <br />
                                <br />
                                Da li želite da isplatite sav novac sa ovog računa?
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant='primary' value="true" onClick={e => { this.isplataNovcaSve(e); } }>
                                <Spinner 
                                    as="span"
                                    animation="grow"
                                    size="sm"
                                    role="status"
                                    hidden = {!this.state.isUProcesu}
                                />
                            {
                                !this.state.isUProcesu ? (
                                    "Isplati novac"
                                ) :
                                    "Molimo sačekajte"
                                }
                                </Button>
                                <Button variant='danger' value="false" onClick={e => { this.isplataNovcaSve(e); } } >Odustani</Button>           
                            </Modal.Footer>
                        </>                         
                ): 
                   <><ModalBody>
                                    Uspešno ste isplatili novac sa računa korisnika
                                    <br />
                                    Podaci o isplati novca:
                                    <br />
                                    <br />
                                    {this.state.podaciOZatvaranu?.map((p: any) => (
                                        <>
                                        <p><b>{p.valuta}</b>: {p.iznos}</p>
                                        <br />
                                        </>
                                        

                                    ))}
                        </ModalBody><Modal.Footer>
                            <Button disabled = {this.state.isUProcesu} variant='primary' value="true" onClick={e => { this.closeRacun(e); } }>
                            <Spinner 
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            hidden = {!this.state.isUProcesu}
                        />
                        {
                        !this.state.isUProcesu ? (
                            "Nastavi sa zatvaranjem računa"
                        ) :
                            "Molimo sačekajte"
                        }
                            </Button>
                    </Modal.Footer></> 
                }
            </Modal>
            <Modal show = {this.state.showPoslednji}>
                <Modal.Header>
                    <Modal.Title>Zatvaranje računa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Račun koji želite da zatvorite je poslednji račun za korisnika. Ukoliko zatvorite ovaj račun korisnik će biti obrisan
                    <br />
                    <br />
                    Da li želite da nastavite sa zatvaranjem računa?
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled = {this.state.isUProcesu} variant='primary' value="true" onClick={e => { this.zatvoriPoslednji(e); } }>
                        <Spinner 
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            hidden = {!this.state.isUProcesu}
                        />
                        {
                        !this.state.isUProcesu ? (
                            "Nastavi sa zatvaranjem računa"
                        ) :
                            "Molimo sačekajte"
                        }
                        </Button>
                        <Button disabled = {this.state.isUProcesu} onClick={e => { this.zatvoriPoslednji(e); }} variant='danger' value="false" >Odustani</Button>   
                </Modal.Footer>
            </Modal>    
           
        </Container>   


        )
    }

    private show() {
        this.setState({
            show: true
        })
    }

    private close(e: any) {
        this.setState(
            {
                show: false
            }
        )

        if(e !== null) {
            if(e.target.value === "true") {
                this.obrisi();
            }
        }
    }

    private obrisi() {
        this.setState({
            isUProcesu: true
        })

        KorisnikService.obrisiKorisnika()
        .then(res => {
            if(res.success) {
                this.getKorisnik();
                this.setState({
                    isObrisan: true,
                    isUProcesu: false
                    
                })

                addAktivnost(window.location.href, "Službenik obrisao korisnika.", "sluzbenik");
            } else {
                this.setState({
                    isGreskaKorisnik: true,
                    isUProcesu: false,
                    show: true
                })
            }
        })
    }

    private closeRacun(e: any) {
        this.setState({
            isUProcesu: true
        })

        if(e.target.value === "true") {
            RacunService.obrisiRacun({
                racunId: this.state.racunId
            })
            .then(res => {
                if(res.success) {
                    this.getRacun();
                    this.setState({
                        isUProcesu: false
                    })
                    addAktivnost(window.location.href, "Službenik zatvorio račun za korisnika.", "sluzbenik");
                } else {
                    if(res.message.isImaNovca) {
                        this.setState({
                            isGreskaRacun: true,
                            showRacun: true,
                            isUProcesu: false    
                        })
                    } else if(res.message.isPoslednji) {
                        this.setState({
                            isGreskaRacun: true,
                            showPoslednji: true,
                            isUProcesu: false    
                        })    
                    }
                }
            })
        
            
        }
        this.setState({
            showRacun: false
        })
    }

    private showRacun(e: any) {
        this.setState({
            showRacun: true,
            racunId: +(e.target.value)
        })
    }

    private isplataNovcaSve(e: any) {
        this.setState({
            isUProcesu: true
        })

        if(e.target.value === "true") {
            if(this.state.racunId !== null) {
                TransakcijaService.isplataNovcaSve({
                    racun_id: this.state.racunId
                })
                .then(res => {
                    if(res.success) {
                        this.setState({
                                prikazZatvaranje: true,
                                podaciOZatvaranu: res.podaci,
                                isUProcesu: false
                            }    
                        )
                    }
                })
            }    
        } else {
            this.setState({
                showRacun: false
            })
        }
    }

    private zatvoriSveRacune(e: any) {
        this.setState({
            isUProcesu: true
        })

        if(e.target.value === "true") {
            RacunService.obrisiSveKorisnik()
            .then(res => {
                if(!res.success) {
                    this.setState({
                        prikazBrisanje: true,
                        isUProcesu: false
                    })
                } else {
                    this.getRacun();
                    this.setState({
                        isZatvorio: true,
                        prikazBrisanje: true,
                        isUProcesu: false
                    })
                }
            })
        }
    }

    private zatvoriPoslednji(e: any) {
        this.setState({
            isUProcesu: true
        })

        if(e.target.value === "true") {
            console.log(this.state.racunId);
            RacunService.obrisiRacunPoslednji({
                racunId: this.state.racunId
            })
            .then(res => {
                if(res.success) {
                    this.getKorisnik();
                    this.setState({
                        isObrisan: true,
                        showPoslednji: false,
                        isUProcesu: false
                    })
                }
            })
        } else {
            this.setState({
                isUProcesu: false,
                showPoslednji: false
            })
        }
    } 
}