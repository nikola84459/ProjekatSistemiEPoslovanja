# Generate a pair of RSSA keys (private and public)

## OpenSSL

openssl req -newkey rsa:2048 -new -nodes -keyout name.private -out name.csr

openssql x509 -req -days 365 -in name.csr signkey name.private -out name.public 

openssl req -newkey rsa:2048 -new -nodes -keyout sluzbenik-auth.private -out sluzbenik-auth.csr
openssl x509 -req -days 365 -in sluzbenik-auth.csr signkey sluzbenik-auth.private -out sluzbenik-auth.public
openssl req -newkey rsa:2048 -new -nodes -keyout sluzbenik-refresh.private -out sluzbenik-refresh.csr
openssl x509 -req -days 365 -in sluzbenik-refresh.csr signkey sluzbenik-refresh.private -out sluzbenik-refresh.public

openssl req -newkey rsa:2048 -new -nodes -keyout korisnik-auth.private -out korisnik-auth.csr
openssl x509 -req -days 365 -in korisnik-auth.csr signkey korisnik-auth.private -out korisnik-auth.public
openssl req -newkey rsa:2048 -new -nodes -keyout korisnik-refresh.private -out korisnik-refresh.csr
openssl x509 -req -days 365 -in korisnik-refresh.csr signkey korisnik-refresh.private -out korisnik-refresh.public

