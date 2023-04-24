// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import {Container, ListGroup } from 'react-bootstrap';
import { Link } from "react-router-dom"
import "./menu.css"
import React from 'react';
import { addAktivnost } from '../../Dnevnik/Dnevnik';
import HeaderComponent from '../NaslovComponent/NaslovComponent';

class MenuProperties {
    uloga: "korisnik" | "sluzbenik" | null
}


export default class Menu extends React.Component<MenuProperties> {
    
    render() {
        return (
            <>
            {               
            this.props.uloga === "korisnik" ? (
                <Navbar className='menu' bg="primary" variant="dark">
                    <Navbar.Brand as={Link} className='menuElement' to="/korisnik/pregledRacuni">NetBanking</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/transakcija" className='link'>Prenos novca</Nav.Link>
                        <Nav.Link as={Link} to="/menjacnica" className='link'>Menjačnica</Nav.Link>
                        <Nav.Link as={Link} to="/licniPodaci" className='link'>Moji podaci</Nav.Link>
                        <Nav.Link as={Link} id='odjava' to="/odjavaKorisnik" className='link'>Odjava</Nav.Link>
                    </Nav>
                </Navbar>
            ): 
                this.props.uloga === "sluzbenik" ? (       
                    <Navbar className='menu' bg="primary" variant="dark">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/sluzbenikPocetna" className='link'>Početna</Nav.Link>
                        <Nav.Link as={Link} to="/pretragaKorisnika" className='link'>Pretraga Korisnika</Nav.Link>
                        <Nav.Link as={Link} to="/dodajKorisnika" className='link'>Otvaranje računa</Nav.Link>
                        <Nav.Link as={Link} id='odjava' to="/izmenaSifreSluzbenik" className='link'>Izmena šifre</Nav.Link>
                        <Nav.Link as={Link} id='odjava' to="/odjavaSluzbenik" className='link'>Odjava</Nav.Link>
                    </Nav>    
                </Navbar> 
            ) : ""         
        }
            
        </>
        
    )
}

   
}