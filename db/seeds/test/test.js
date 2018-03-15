
exports.seed = function(knex, Promise) {
  return knex('palettes').del()
  .then(() => knex('projects').del())
  .then(() => {
    return Promise.all([
      knex('projects').insert({
        project_name: 'Foo'
      }, 'id')
      .then(project => {
        return knex('palettes').insert([
          {
            palette_name: "Palette 1",
            project_id: project[0],
            color1: "#81946A",
            color2: "#F8CE9D",
            color3: "#7AC2E3",
            color4: "#43ADC4",
            color5: "#6E498B"
          },
          {
            palette_name: "Not Fun",
            project_id: project[0],
            color1: "#68DE43",
            color2: "#78177A",
            color3: "#AC7CD6",
            color4: "#7871AB",
            color5: "#B9DF4C"
          }
        ], 'id')
      })
      .then(() => console.log('Seeding complete!'))
      .catch(error => console.log(`Error seeding data: ${error}`))
    ])
  })
  .catch(error => console.log(`Error seeding data: ${error}`));
};
