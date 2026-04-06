export interface PlatoSimplificado {
  nombre: string;
  precio: number;
}

export interface CartaCategoria {
  categoria: string;
  platos: PlatoSimplificado[];
}

export const cartaData: CartaCategoria[] = [
  {
    categoria: "Picoteos",
    platos: [
      { nombre: "Focaccia tradicional con aceite de oliva", precio: 6.00 },
      { nombre: "Anchoas de Santoa La Catalina", precio: 24.00 },
      { nombre: "Croquetas de chuleta ahumada con mayonesa de chimichurri (8 ud)", precio: 17.00 },
      { nombre: "Croquetas cremosas de jamon iberico (8 ud)", precio: 13.50 },
      { nombre: "Nachos caseros con cochinita pibil", precio: 17.00 },
      { nombre: "Patatas rusticas con dos salsas", precio: 11.50 },
      { nombre: "Rabas de aqui", precio: 16.00 },
      { nombre: "Fingers de pollo con mayo de miel y mostaza", precio: 13.00 },
      { nombre: "Mejillones al vapor con toque de Martini o picantones en salsa", precio: 15.50 },
      { nombre: "Patatas rusticas con carne mechada, huevo frito y jugo de carne", precio: 15.50 },
      { nombre: "Zamburinas al ajillo", precio: 18.00 },
      { nombre: "Provoletta clasica al oregano con focaccia", precio: 12.50 },
      { nombre: "Provoletta Isabella con jamon iberico y mermelada de pimientos", precio: 15.50 },
      { nombre: "Parmigianna della Nonna", precio: 15.00 }
    ]
  },
  {
    categoria: "Risottos",
    platos: [
      { nombre: "Falso risotto de verduritas y orzo", precio: 16.50 },
      { nombre: "Risotto de setas y jamon iberico", precio: 19.50 },
      { nombre: "Risotto de costilla deshuesada y salvia", precio: 18.00 },
      { nombre: "Risotto trufado de foie con reduccion de PX", precio: 20.00 }
    ]
  },
  {
    categoria: "Pastas",
    platos: [
      { nombre: "Fetuccine Genovese", precio: 16.00 },
      { nombre: "Tagliatelle alla Alfredo", precio: 16.00 },
      { nombre: "Spaguetti de chitarra con carbonara de la Nonna", precio: 16.00 },
      { nombre: "Rigatoni a la Puttanesca", precio: 16.00 },
      { nombre: "Tagliatelle nero di sepia ai frutti di mare", precio: 16.00 },
      { nombre: "Fagottinni de espinacas con ricota, gorgonzola y pera", precio: 18.00 },
      { nombre: "Sorrentino de bondiola desmenuzada", precio: 18.00 }
    ]
  },
  {
    categoria: "Carnes",
    platos: [
      { nombre: "Chorizo criollo argentino con chimichurri", precio: 12.00 },
      { nombre: "American Burger (cheddar, edam, rucula y 3 salsas)", precio: 15.00 },
      { nombre: "Smash Burger (doble carne, queso, cebolla caramelizada)", precio: 15.50 },
      { nombre: "Burger Patagonica estilo Wellington", precio: 18.00 },
      { nombre: "Entrana de ternera corte argentino", precio: 22.50 },
      { nombre: "Costilla de vaca tudanca a baja temperatura (72h)", precio: 21.00 },
      { nombre: "Solomillo de vacuno mayor", precio: 28.00 },
      { nombre: "Ojo de Bife Argentino D.O.P.", precio: 36.00 },
      { nombre: "Chuleton de los Valles Pasiegos", precio: 62.00 },
      { nombre: "Entrecote de los Valles Pasiegos", precio: 70.00 }
    ]
  },
  {
    categoria: "Milanesas",
    platos: [
      { nombre: "Milanesa a Caballo (ternera, huevo, tuco y patatas)", precio: 14.00 },
      { nombre: "Milanesa a la Napolitana (mozarella, tuco y pesto)", precio: 16.00 },
      { nombre: "Milanesa Gaucha (provolone, chimichurri y tomates asados)", precio: 16.00 },
      { nombre: "Milanesa al Funghi (boletus, trufa y crema de parmesano)", precio: 17.50 }
    ]
  },
  {
    categoria: "Empanadas",
    platos: [
      { nombre: "Empanada Criollas", precio: 3.80 },
      { nombre: "Empanada de Pollo", precio: 3.80 },
      { nombre: "Empanada BBQ", precio: 3.80 },
      { nombre: "Empanada Cortado cuchillo", precio: 3.80 },
      { nombre: "Empanada Capresse", precio: 3.80 },
      { nombre: "Empanada Tres Quesos", precio: 3.80 },
      { nombre: "Empanada de Espinaca", precio: 3.80 },
      { nombre: "Empanada Fugaceta", precio: 3.80 },
      { nombre: "Empanada de Humita", precio: 3.80 }
    ]
  },
  {
    categoria: "Ensaladas",
    platos: [
      { nombre: "Ventresca con pimientos asados y cebolla morada", precio: 17.50 },
      { nombre: "Ensalada Cesar con picatostes y torreznos de panceta iberica", precio: 19.00 },
      { nombre: "Ensalada de Nico con burrata de Puglia y pesto de tomate seco y aceituna negra", precio: 18.50 },
      { nombre: "Carpaccio de Gamba Roja con vinagreta de citricos y aceite del coral", precio: 19.00 },
      { nombre: "Carpaccio de solomillo de ternera con vinagreta de tomate concasse y parmesano", precio: 19.00 },
      { nombre: "Vitello Tonnatto con alino Isabella", precio: 18.00 },
      { nombre: "Salteado de verduritas de temporada", precio: 18.00 },
      { nombre: "Tartar de ternera hecho al momento", precio: 21.00 }
    ]
  },
  {
    categoria: "Postres",
    platos: [
      { nombre: "Alfajor de maicena", precio: 3.00 },
      { nombre: "Tarta de queso Siempre juntas", precio: 6.50 },
      { nombre: "Brownie de chocolate y nueces con helado", precio: 6.50 },
      { nombre: "Tiramisu demascarpone", precio: 6.50 },
      { nombre: "Panqueque con dulce de leche y helado", precio: 7.00 },
      { nombre: "Tarta de queso especial", precio: 9.50 }
    ]
  }
];