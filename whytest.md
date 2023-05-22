
Integration testing

code example
https://gitlab.badr.co.id/badr-interactive/node-integration-test-example

# Piramida testing
- unit test : test function/class secara independet, tanpa akses io (network,database, filesystem)
- integration test (network, database,)
- end to end testing : test dengan real UI dan real browser

# Why Testing 
pros
+ Reduce bugs, test case lebih rapi
+ Test-test case yang ditulis bisa digunakan sebagai dokumentasi developer lain
+ Safe Refactoring : developer lebih pede ketika merefactor kode tanpa merusak kode yang exisiting
+ Reduce repetitve testing
+ Improve developer experience : feedback loop yang cepat

cons

- Perlu investasi waktu buat nulis testing

# Apa yang perlu ditest (integration)
- validasi parameter/body yang dikirim, secara tipe data & bisnis prosesnya
- response api nya 
- state didatabase


# Tools
- Mocha
- Supertest - http test
- chai - assertion library
- knex - buat check database

# Action Plan
- Research lebih lanjut test case yang lebih sulit (harusnya ga lama)
  - integrasi 3rd party api (misal midtrans), 
  - kirim email, 
  - upload files, 
  - integrasi ke dependency tambahan misal redis/minio
- Sharing ke knowlede rekan lain
- Review code, apa cara ngetestnya sama test-test casenya udah bagus apa belum