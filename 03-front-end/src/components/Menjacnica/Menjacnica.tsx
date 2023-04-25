import React from "react";
import BasePage from "../BasePage/BasePage";
import { Container, Form, Button, Alert, Modal, Table, Spinner } from "react-bootstrap";
import "./menjacnica.css"
import RacunModel, { RacunValuta } from "../../../../03-back-end/src/components/racun/model";
import RacunService from "../../services/RacunService";
import { timeStamp } from "console";
import TransakcijaService from "../../services/TransakcijaService";
import { isUlogaUlogovana } from "../../Api/api";
import EventRegister from "../../Api/EventRegister";
import { Redirect } from "react-router-dom";
import getLocationAndIp from "../../Dnevnik/Dnevnik";
import DnevnikService from '../../services/DnevnikService';
import { addAktivnost } from '../../Dnevnik/Dnevnik';
import NaslovComponent from "../NaslovComponent/NaslovComponent";

class MenjacnicaState {
    isKupovina: boolean;
    isProdaja: boolean;
    racuni: RacunModel[] | null;
    valutePrikaz: any[] | null;
    racunPlatiocId: number;
    racunPrimaocId: number;
    valutaId: number;
    iznos: number;
    poruka: string;
    uspesno: string;
    isUlogovan: boolean | null;
    potvrda: boolean;
    valutaNaziv: string;
    brRacunPlatioc: string;
    brRacunPrimaoc: string;
    isTransakcija: boolean;
    kupovniKurs: number;
    prodajniKurs: number
}

export default class Menjacnica extends BasePage<{}> {
    state: MenjacnicaState;
    
    constructor(props: any) {
        super(props);

        this.state = {
           isKupovina: false,
           isProdaja: false,
           racuni: null,
           valutePrikaz: null,
           racunPlatiocId: 0,
           racunPrimaocId: 0,
           valutaId: 0,
           iznos: 0,
           poruka: "",
           uspesno: "",
           isUlogovan: null,
           potvrda: false,
           valutaNaziv: "",
           brRacunPlatioc: "",
           brRacunPrimaoc: "",
           isTransakcija: false,
           kupovniKurs: 0,
           prodajniKurs: 0
        }

    }

    private getRacun() {
        RacunService.getRacuniByKorisnik()
        .then(res => {
            this.setState({
                racuni: res
            })
                   
        })
    }

    private changeRacun(e: any) {
        let valute: any[] = [];
        

      this.state.racuni?.map(ra => {
        if(ra.racun_id === +(e.target.value)) {
            ra.racun_valuta.map(v => {
                valute.push(v.valutaa)
            })
        }
      })

      this.setState({
        valutePrikaz: valute,
           
      })

      if(this.state.isKupovina) {
        this.setState({
            racunPrimaocId: +(e.target.value)    
        })
      } else {
            this.setState({
                racunPlatiocId: +(e.target.value)    
            })
      }
    } 
        
    componentDidMount() {
        isUlogaUlogovana("korisnik")
        .then(res => {
            if(!res) {
                EventRegister.emit("AUTH_EVENT", "force_login");
                this.setState({
                    isUlogovan: false
                })
                return;
            } else {
                this.setState({
                    isUlogovan: true
                })
            }
        })
        this.getRacun();
        addAktivnost(window.location.href, "Započeta razmena novca.", "korisnik");
    }

    componentWillUnmount(): void {
       addAktivnost(window.location.href, "Završena razmena novca", "korisnik")
    }
    
    renderMain(): JSX.Element {
        if(this.state.isUlogovan === false) {
            return <Redirect to={"/security/prijavaKorisnik"} />
        }
        return (
            <Container className="container">
                                
                {
                    !this.state.isProdaja && !this.state.isKupovina ? (
                <>
                <div className="menjacnica">
                    <h2 className="poruka">Molimo Vas izaberite jednu od ponudjenih opcija</h2>
                    <Form className="izbor">
                        <div key={`default-radio`} className="mb-3">
                            <Form.Check
                                value={"true"}
                                type={"radio"}
                                id={"kupovina"}
                                label={"Kupovina deviza"}
                                onChange={e => {this.isKupovina(e)}} />

                            <Form.Check
                                value={"true"}
                                type={"radio"}
                                label={"Prodaja deviza"}
                                id={"prodaja"} 
                                onChange={e => {this.isProdaja(e)}}/>
                        </div>
                    </Form>
                </div>
                </>
            ): (  
               
            <Form>
                 {
                this.state.isKupovina ? (    
            <NaslovComponent poruka="Menjačnica - Kupovina deviza" />
            ) : 
            <NaslovComponent poruka="Menjačnica - Prodaja deviza" />
            }
               {
                    this.state.poruka !== "" ? (
                <Alert className="alert" key={"danger"} variant={"danger"}>{this.state.poruka}</Alert>
                ): ""}
                {
                    this.state.uspesno !== "" ? (
                <Alert className="alert" key={"success"} variant={"success"}>{this.state.uspesno}</Alert>
                ): ""}  
           
            <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Račun platioc</Form.Label>
            {
                this.state.isKupovina ? (
            <Form.Select name="racunPlatiocId" onChange={e => {this.uzmiPodatke(e)}}>
                <option>Odaberite račun</option>
                    {
                        this.state.racuni?.map(ra => (
                            ra.tip === "dinarski" ? (
                    <option value={ra.racun_id}>{ra.br_racuna}</option>
                    ): ""
                ))   
                }
                  
                
        </Form.Select>
            ): 
                this.state.isProdaja ? (
                    <Form.Select onChange={e => {this.changeRacun(e)}}>
                        <option>Odaberite račun</option>
                        {
                            this.state.racuni?.map(ra => (
                                ra.tip === "devizni" ? (
                                <option value={ra.racun_id}>{ra.br_racuna}</option>
                        ): ""
                        ))
                        }  
                    </Form.Select>

            ): ""        
               
            }      
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Račun primaoc</Form.Label>
            {
                this.state.isKupovina ? (
            <Form.Select onChange={e => {this.changeRacun(e)}}>
                    <option>Odaberite račun</option>
                    {
                        this.state.racuni?.map(ra => (
                            ra.tip === "devizni" ? (
                        <option value={ra.racun_id}>{ra.br_racuna}</option>
                        ): ""
                    ))
                    }
            </Form.Select>
            ):
                    this.state.isProdaja ? (
                <Form.Select name="racunPrimaocId" onChange={e => {this.uzmiPodatke(e)}}>
                    <option>Odaberite račun</option>
                    {
                        this.state.racuni?.map(ra => (
                            ra.tip === "dinarski" ? (
                    <option value={ra.racun_id}>{ra.br_racuna}</option>
                    ): ""
                    ))
                    }    
                </Form.Select> 
            ): ""       
            
            }
            </Form.Group><Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Valuta</Form.Label>
                <Form.Select name="valutaId" onChange={e => {this.uzmiPodatke(e)}}>
                {
                    this.state.valutePrikaz !== null ? (
                        <option>Odaberite valutu</option>
                    ): ""
                }
                {
                    this.state.valutePrikaz === null ? (
                        <option>Morate odabrati devizni račun kako bi se prikazale valute</option>
                    ): 
                                                
                        this.state.valutePrikaz?.map(v => (
                        <option value={v.valuta_id}>{v.sifra}</option>
                       
                    ))
                    
                }
                </Form.Select>
             </Form.Group>
             <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Iznos</Form.Label>
                <Form.Control name="iznos" onChange={e => {this.uzmiPodatke(e)}} type="number" placeholder="Unesite iznos u valuti računa primaoca" />
             </Form.Group>
             <Button onClick={() => {this.prikaziObavestenje()}} variant="primary">
                Izvršite razmenu novca
            </Button>
    </Form>
    )}

<Modal show={this.state.potvrda}>
                   <Modal.Header>
                    {
                        this.state.isKupovina ? (
                        <Modal.Title>Menjačnica - kupovina</Modal.Title>
                    ): 
                       <Modal.Title>Menjačnica - prodaja</Modal.Title>      
                    }    
                   </Modal.Header>

                   <Modal.Body>
                        Da li sigurno želite da izvršite transakciju sa podacima: 
                        <br />
                        
                        <br />
                        <Table striped bordered hover size="sm">
                            <tr>
                                <th>Broj računa sa kojeg se plaća</th>
                                <td>{this.state.brRacunPlatioc}</td>
                            </tr>

                            <tr>
                                <th>U korist računa</th>
                                <td>{this.state.brRacunPrimaoc}</td>    
                            </tr>
                            
                             {
                             this.state.isKupovina ? (  
                                <> 
                                <tr>
                                    <th>Valuta</th>
                                    <td>Iz valute: <b>RSD</b>, U valutu: <b>{this.state.valutaNaziv.toLocaleUpperCase()}</b></td>
                                </tr> 
                                <tr>
                                    <th>Iznos</th>
                                    <td>{(this.state.iznos / this.state.kupovniKurs).toFixed(2)} <b>{this.state.valutaNaziv.toLocaleUpperCase()}</b></td>
                                </tr>
                                </>  
                            ): 
                                <>
                                <tr>
                                    <th>Valuta</th>
                                    <td>Iz valute <b>{this.state.valutaNaziv.toLocaleUpperCase()}</b>, U valutu: <b>RSD</b></td>
                                </tr>
                                <tr>
                                    <th>Iznos</th>
                                    <td>{(this.state.iznos * this.state.prodajniKurs).toFixed(2)} <b>RSD</b></td>
                                </tr>
                                </>
                            }
                                                    
                            <tr>
                                <th>Iznos u valuti plaćanja</th>
                                {
                                    this.state.isKupovina ? (
                                        <td>{this.state.iznos} <b>RSD</b></td>
                                ): 
                                        <td>{this.state.iznos} <b>{this.state.valutaNaziv.toLocaleUpperCase()}</b></td>    
                                }
                            </tr>
                        </Table>
                   </Modal.Body>
                    <Modal.Footer>
                        <Button disabled = {this.state.isTransakcija} variant='primary' value="true" onClick={e => {this.posaljiPodatke(e)}}>
                        <Spinner 
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            hidden = {!this.state.isTransakcija}
                        />
                        {
                        !this.state.isTransakcija ? (
                            "Potvrdi"
                        ) :
                            "Molimo sačekajte"
                        }
                            
                            </Button>
                        <Button disabled = {this.state.isTransakcija} variant='danger' value="false" onClick={e => {this.posaljiPodatke(e)}}>Odustani</Button>
                    </Modal.Footer>

            </Modal>            
            </Container>    
        )
    }
    
    private isKupovina(e: any) {
        this.setState(
            {
                isKupovina: JSON.parse(e.target.value)
            }
        )
    }

    private isProdaja(e: any) {
        this.setState(
            {
                isProdaja: JSON.parse(e.target.value)
            }
        )
    }

    private uzmiPodatke (e: any) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    private prikaziObavestenje() {
        let nazivValuta = "";
        let brPlatioc = "";
        let brPrimaoc = "";
        let kursKupovina = null;
        let kursProdaja = null
        
        if(this.state.racunPlatiocId !== 0 && this.state.racunPlatiocId !== 0 && this.state.valutaId !== 0 && this.state.iznos !== 0) {
            this.setState({
                poruka: ""
            })

            this.state.racuni?.map(r => {
                if(r.racun_id === +(this.state.racunPlatiocId)) {
                    brPlatioc = r.br_racuna;
                
                }

                if(r.racun_id === +(this.state.racunPrimaocId)) {
                    brPrimaoc = r.br_racuna;
                }
          
                for(const j of r.racun_valuta) {
                    if(j.valuta_id === +(this.state.valutaId)) {
                        nazivValuta = j.valutaa.sifra
                        kursKupovina = j.valutaa.kupovni_kurs;
                        kursProdaja = j.valutaa.prodajni_kurs;
                    }
                }
            
            })
           
            this.setState({
                valutaNaziv: nazivValuta,
                brRacunPlatioc: brPlatioc,
                brRacunPrimaoc: brPrimaoc,
                potvrda: true,
                kupovniKurs: kursKupovina,
                prodajniKurs: kursProdaja
            })
        
        } else {
            this.setState({
                poruka: "Morate popuniti sva polja."
            })
        }
        
    }

    private posaljiPodatke(e: any) {
        this.setState({
            isTransakcija: true
        })

        if(e.target.value === "true") {
            if(this.state.racunPlatiocId !== 0 && this.state.racunPlatiocId !== 0 && this.state.valutaId !== 0 && this.state.iznos !== 0) {
                this.setState({
                    poruka: ""
                })

                TransakcijaService.menjacnica({
                    racun_id: +(this.state.racunPlatiocId),
                    racun_primaoc_id: +(this.state.racunPrimaocId),
                    valuta_id: +(this.state.valutaId),
                    iznos: +(this.state.iznos),
                    isKupovina: this.state.isKupovina ? true : false
                })
                .then(res => {
                    if(!res.success) {
                        this.setState({
                            potvrda: false,
                            poruka: res.message,
                            isTransakcija: false
                        })
                    } else {
                        this.setState({
                            potvrda: false,
                            uspesno: "Uspešno ste izvršili razmenu novca.",
                            isTransakcija: false
                        })
                
                        addAktivnost(window.location.href, "Korisnik izvršio razmenu novca", "korisnik");
                    }
                })
            } else {
                this.setState({
                    poruka: "Morate popuniti sva polja"
                })
            }
        } else {
            this.setState({
                potvrda: false
            })
        }
    }
}