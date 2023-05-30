
# Integration testing

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
- parameter/body yang dikirim
   - secara tipe data
   - proses bisnisnya, misal paramater stok tidak boleh lebih dari stok yang available
- authorization (sudah login atau belum, role permissions)
- response api (body, status)
- persistent state (mysql, redis, filesystem etc)


# Tools
- Mocha
- Supertest - http test
- chai - assertion library
- knex - buat check database