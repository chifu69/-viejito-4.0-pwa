/*
  Industrial IA 5.28 — Davis-Standard Knowledge Brain
  Curated from broadly applicable plastics-extrusion references (Dynisco and Davis-Standard).
  Purpose: give the local chat practical extrusion-process knowledge without requiring internet access.
  Guardrail: generic process education only. Plant-specific setpoints, hazardous maintenance,
  startup/shutdown, purging, interlocks, gas/blowing-agent handling, and mechanical adjustments
  must follow the site's approved SOP, equipment manual, and trained-personnel requirements.
*/
window.EXTRUSION_KNOWLEDGE_META = Object.freeze({
  version:'2.1',
  updated:'2026-08-24',
  sources:['Davis-Standard PS Foam Sheet Systems','Davis-Standard Basic Extruder Control Functionality Parts I-II','Fundamentals of Foam Sheet Extrusion Using a Tandem Extrusion Line','Dynisco Extrusion Processors Handbook']
});

window.EXTRUSION_KNOWLEDGE = Object.freeze([
  {
    id:'extrusion-overview',
    title:{en:'How extrusion works',es:'Cómo funciona la extrusión'},
    keys:['extrusion process','extruder process','how extruder works','how extrusion works','proceso de extrusion','proceso extrusor','como funciona el extruder','como funciona la extrusion'],
    en:'A thermoplastic extrusion line continuously feeds material into a heated barrel, the rotating screw conveys, compresses, melts and mixes it, and the melt is pushed through a die to form the product. Downstream equipment then cools, pulls, slits or winds the product. Stable output depends on keeping feed, melt condition, pressure, temperature, screw speed and downstream pull reasonably steady.',
    es:'Una línea de extrusión termoplástica alimenta material continuamente a un barril calentado. El tornillo lo transporta, comprime, funde y mezcla; después el material fundido pasa por el die para formar el producto. Los equipos posteriores enfrían, jalan, cortan o enrollan el material. Para mantener una producción estable hay que mantener razonablemente estables la alimentación, condición del melt, presión, temperatura, velocidad del tornillo y el jalado de la línea.'
  },
  {
    id:'screw-zones',
    title:{en:'Extruder screw zones',es:'Zonas del tornillo del extruder'},
    keys:['feed zone','compression zone','transition zone','metering zone','screw zones','zona de alimentacion','zona de compresion','zona de transicion','zona de medicion','zonas del tornillo'],
    en:'A general-purpose single screw normally has three main regions. The feed zone conveys solid resin from the hopper. The transition/compression zone reduces channel depth so the material compacts and melts. The metering zone has a more constant channel depth and delivers a more uniform melt toward the die. Problems in one zone can show up downstream as unstable output, poor melting, pressure changes or product variation.',
    es:'Un tornillo de propósito general normalmente tiene tres regiones principales. La zona de alimentación mueve la resina sólida desde el hopper. La zona de transición/compresión reduce la profundidad del canal para compactar y fundir el material. La zona de medición entrega un melt más uniforme hacia el die. Un problema en cualquiera de estas zonas puede aparecer después como producción inestable, material sin fundir, cambios de presión o variación del producto.'
  },
  {
    id:'feed-throat',
    title:{en:'Feed throat and material feeding',es:'Feed throat y alimentación de material'},
    keys:['feed throat','hopper','bridging','starve feed','material feed','feeding problem','tolva','alimentacion de material','puente de material','material no baja'],
    en:'The feed system has to deliver material consistently. Bridging, poor free flow, incorrect feed-throat temperature, moisture, contamination or inconsistent blending can create unstable screw fill and therefore unstable output. When a process surges, checking whether material is feeding uniformly is one of the first useful checks.',
    es:'El sistema de alimentación tiene que entregar material de forma consistente. Un puente de material, mal flujo, temperatura incorrecta del feed throat, humedad, contaminación o mezcla inconsistente pueden llenar el tornillo de forma irregular y causar producción inestable. Si el proceso está surging, revisar primero si el material está entrando de forma uniforme es una buena verificación.'
  },
  {
    id:'screw-speed',
    title:{en:'Screw speed',es:'Velocidad del tornillo'},
    keys:['screw speed','extruder rpm','rpm','velocidad del tornillo','velocidad extruder','revoluciones'],
    en:'Screw speed is a major output variable. Increasing RPM generally increases material throughput, but it can also increase shear heating, motor load and melt temperature. A screw-speed change can alter output quickly while thermal effects take longer to stabilize. For troubleshooting, change one variable at a time and allow the process to settle before judging the result.',
    es:'La velocidad del tornillo es una variable principal de producción. Aumentar RPM normalmente aumenta el material procesado, pero también puede aumentar el calentamiento por shear, la carga del motor y la temperatura del melt. Un cambio de RPM puede cambiar la producción rápido, mientras los efectos térmicos tardan más en estabilizarse. Para diagnosticar, cambia una variable a la vez y deja que el proceso se estabilice antes de evaluar el resultado.'
  },
  {
    id:'barrel-temperature',
    title:{en:'Barrel temperature',es:'Temperatura del barrel'},
    keys:['barrel temperature','heater zone','temperature zone','zone temperature','temperatura barrel','temperatura del barril','zona de temperatura','heater'],
    en:'Barrel temperature control helps establish stable melting and viscosity. Setpoint temperature and actual melt temperature are not always the same because the polymer also receives shear heat from the screw. Temperatures that are too low can contribute to poor melting or high viscosity; temperatures that are too high can reduce viscosity or promote degradation, depending on the resin. Use approved material and machine settings rather than guessing setpoints.',
    es:'El control de temperatura del barrel ayuda a mantener una fusión y viscosidad estables. El setpoint del barril y la temperatura real del melt no siempre son iguales porque el polímero también recibe calor por shear del tornillo. Temperaturas demasiado bajas pueden causar mala fusión o alta viscosidad; demasiado altas pueden bajar la viscosidad o degradar el material, según la resina. Usa los settings aprobados del material y la máquina, no inventes temperaturas.'
  },
  {
    id:'melt-temperature',
    title:{en:'Melt temperature',es:'Temperatura del melt'},
    keys:['melt temperature','polymer temperature','product temperature','temperatura del melt','temperatura del material','temperatura producto'],
    en:'Melt temperature strongly affects viscosity and therefore pressure, flow and product quality. Stable melt temperature usually supports stable dimensions and output. If melt temperature is drifting, look at screw speed, heater/cooling behavior, material feed, residence time and whether the measurement itself is reliable.',
    es:'La temperatura del melt afecta directamente la viscosidad y por eso influye en presión, flujo y calidad. Una temperatura de melt estable normalmente ayuda a mantener dimensiones y producción estables. Si está variando, revisa velocidad del tornillo, heaters/cooling, alimentación de material, tiempo de residencia y que la medición sea confiable.'
  },
  {
    id:'head-pressure',
    title:{en:'Head pressure / die pressure',es:'Head pressure / presión del die'},
    keys:['head pressure','die pressure','melt pressure','pressure at die','presion de cabeza','presion del die','presion del melt','presion extruder'],
    en:'Head or die pressure is one of the best indicators of extrusion stability. With otherwise steady conditions, stable melt pressure usually supports stable output. A pressure change can reflect screen-pack restriction, die restriction, material-feed changes, viscosity/melt-temperature changes, screw or barrel condition, or other process disturbances. Pressure alarms and limits are machine-specific and must follow the approved line settings.',
    es:'El head pressure o presión del die es uno de los mejores indicadores de estabilidad del extruder. Con las demás condiciones estables, una presión de melt estable normalmente ayuda a una producción estable. Un cambio puede indicar restricción del screen pack, restricción del die, cambios en alimentación, viscosidad/temperatura del melt, condición del screw/barrel u otra perturbación. Alarmas y límites de presión son específicos de la máquina y deben seguir los settings aprobados.'
  },
  {
    id:'pressure-rising',
    title:{en:'Why pressure may rise',es:'Por qué puede subir la presión'},
    keys:['pressure rising','pressure going up','high head pressure','head pressure high','presion subiendo','presion alta','head pressure sube','porque sube la presion','sube la presion','presion va subiendo'],
    en:'A rising extrusion pressure usually means the melt is meeting more resistance or has become more viscous. Common possibilities include a loading screen pack, restriction or buildup in the die/flow path, lower melt temperature, material or viscosity change, increased throughput, or an instrumentation issue. Compare pressure with melt temperature, screw speed, motor load, output/BW and recent material or screen changes before deciding on a cause.',
    es:'Una presión de extrusión que va subiendo normalmente significa que el melt encuentra más resistencia o está más viscoso. Posibles causas incluyen screen pack cargándose, restricción o buildup en die/flow path, temperatura del melt más baja, cambio de material/viscosidad, mayor throughput o problema de instrumentación. Compara la presión con melt temperature, screw speed, motor load, output/BW y cambios recientes de material o screen antes de decidir la causa.'
  },
  {
    id:'pressure-falling',
    title:{en:'Why pressure may fall',es:'Por qué puede bajar la presión'},
    keys:['pressure falling','pressure dropping','low head pressure','head pressure low','presion bajando','presion baja','head pressure baja','porque baja la presion','baja la presion','presion va bajando'],
    en:'Falling head pressure can come from lower resistance or lower viscosity, but it can also reflect loss of feed or output. Useful checks include material feeding, screw speed, melt temperature, screen/die condition, motor load and whether product output or BW is also moving. Do not assume low pressure automatically means a single control should be increased.',
    es:'Una baja de head pressure puede venir de menos resistencia o menor viscosidad, pero también puede indicar pérdida de alimentación o producción. Conviene revisar alimentación de material, velocidad del tornillo, melt temperature, condición de screen/die, motor load y si el output o BW también está cambiando. No asumas que presión baja significa automáticamente subir un solo control.'
  },
  {
    id:'surging',
    title:{en:'Extruder surging / unstable output',es:'Surging / producción inestable'},
    keys:['surging','surge','pulsing output','unstable output','pressure fluctuating','pressure fluctuation','output fluctuating','produccion inestable','presion fluctuando','pulsaciones'],
    en:'Surging is a repeating variation in output or pressure. Common areas to investigate are inconsistent feed, feed-throat bridging, temperature cycling, inconsistent melting, screw/barrel wear, material variation, screen or die restriction and downstream speed/tension disturbances. Watch which variable moves first: feed, screw load, melt temperature, pressure or output. That sequence often helps locate the source.',
    es:'Surging es una variación repetitiva de producción o presión. Áreas comunes para revisar son alimentación inconsistente, bridging en el feed throat, ciclos de temperatura, fusión irregular, desgaste de screw/barrel, variación de material, restricción de screen/die y cambios de velocidad/tensión downstream. Mira cuál variable cambia primero: feed, screw load, melt temperature, presión u output. Ese orden muchas veces ayuda a encontrar el origen.'
  },
  {
    id:'screen-pack',
    title:{en:'Screen pack and breaker plate',es:'Screen pack y breaker plate'},
    keys:['screen pack','screen changer','breaker plate','screens','malla','paquete de mallas','cambiador de screen'],
    en:'The screen pack filters contamination and also creates flow resistance/back pressure that can improve melt mixing and uniformity. As screens load with contamination, pressure can rise. The breaker plate supports the screens and helps straighten flow. Screen changes and pressure limits must follow the line SOP because hot pressurized polymer is hazardous.',
    es:'El screen pack filtra contaminación y también crea resistencia/back pressure que puede ayudar a mezclar y uniformar el melt. Cuando los screens se cargan de contaminación, la presión puede subir. El breaker plate sostiene los screens y ayuda a enderezar el flujo. Los cambios de screen y límites de presión deben seguir el SOP porque el polímero caliente y presurizado es peligroso.'
  },
  {
    id:'die',
    title:{en:'Extrusion die',es:'Die de extrusión'},
    keys:['extrusion die','die lip','die gap','die restriction','die buildup','labios del die','gap del die','restriccion del die'],
    en:'The die converts the melt flow into the required cross-section. Die temperature, cleanliness, gap/uniformity and flow distribution affect gauge, surface and cross-web balance. Buildup or contamination at the die lips can create lines; uneven die adjustment can create thickness variation. Mechanical die adjustments must follow the plant-approved procedure.',
    es:'El die convierte el flujo del melt en la sección final del producto. Temperatura, limpieza, gap/uniformidad y distribución del flujo afectan gauge, superficie y balance de lado a lado. Buildup o contaminación en los labios puede crear líneas; un ajuste desigual puede crear variación de espesor. Los ajustes mecánicos del die deben seguir el procedimiento aprobado de la planta.'
  },
  {
    id:'steady-state',
    title:{en:'Steady-state troubleshooting',es:'Diagnóstico en estado estable'},
    keys:['one change at a time','steady state','stabilize process','wait after change','una variable a la vez','estado estable','dejar estabilizar','esperar despues del cambio'],
    en:'Extrusion is a continuous process, so good troubleshooting depends on controlled changes. Change one process variable at a time when practical, record what changed, and allow enough time for the line to reach a new steady state before judging the result. Pressure and output may respond quickly; temperature-related effects usually respond more slowly.',
    es:'La extrusión es un proceso continuo, así que un buen diagnóstico depende de cambios controlados. Cuando sea práctico cambia una variable a la vez, registra qué cambiaste y espera suficiente tiempo para que la línea llegue a un nuevo estado estable antes de juzgar el resultado. Presión y output pueden responder rápido; los efectos de temperatura normalmente tardan más.'
  },
  {
    id:'gels-unmelts',
    title:{en:'Gels, unmelts and burned material',es:'Gels, material sin fundir y material quemado'},
    keys:['gels','gel','unmelt','unmelts','charred polymer','burned polymer','black specks','material quemado','material sin fundir','puntos negros'],
    en:'Gels or unmelts can be related to inadequate melting, damaged or worn screw/barrel, poor temperature control or contamination. Burned/charred material can point to excessive thermal exposure, stagnant material or contamination. Compare the defect with actual melt temperature, heater performance, residence time, material handling and the condition/cleanliness of screw, barrel and die.',
    es:'Gels o material sin fundir pueden relacionarse con fusión insuficiente, screw/barrel dañados o gastados, mal control de temperatura o contaminación. Material quemado puede indicar demasiado calor, material estancado o contaminación. Compara el defecto con melt temperature real, funcionamiento de heaters, tiempo de residencia, material handling y limpieza/condición de screw, barrel y die.'
  },
  {
    id:'sharkskin',
    title:{en:'Sharkskin / melt fracture',es:'Sharkskin / melt fracture'},
    keys:['sharkskin','melt fracture','rough surface','surface fracture','piel de tiburon','fractura del melt','superficie rugosa'],
    en:'Sharkskin and melt fracture are flow-related surface distortions that often appear when shear stress or linear extrusion rate is too high for the melt/die condition. They can be influenced by output rate, melt temperature, resin rheology and die geometry/temperature. Treat this as a process-window problem rather than assuming one universal setting fixes it.',
    es:'Sharkskin y melt fracture son defectos de superficie relacionados con el flujo que suelen aparecer cuando el shear o la velocidad lineal son demasiado altos para la condición del melt/die. Pueden cambiar con output rate, melt temperature, reología de la resina y geometría/temperatura del die. Es mejor verlo como un problema de ventana de proceso, no asumir que un solo setting lo arregla siempre.'
  },
  {
    id:'moisture',
    title:{en:'Moisture-related defects',es:'Defectos por humedad'},
    keys:['moisture','wet resin','voids','bubbles','gray streaks','raindrops','humedad','resina mojada','vacios','burbujas','rayas grises'],
    en:'Moisture or condensation in the material stream can cause voids, streaks or unstable appearance depending on the resin and process. Check raw-material condition, dryer/material-handling performance if applicable, and condensation around the feed section. Confirm the defect is actually moisture before changing unrelated process settings.',
    es:'Humedad o condensación en el material puede causar vacíos, rayas o apariencia inestable según la resina y el proceso. Revisa condición de materia prima, dryer/material handling si aplica y condensación cerca de la alimentación. Confirma que realmente sea humedad antes de mover otros settings que no estén relacionados.'
  },
  {
    id:'die-lines',
    title:{en:'Die lines / gauge bands',es:'Die lines / gauge bands'},
    keys:['die lines','gauge bands','film lines','lines in sheet','lineas del die','bandas de calibre','rayas en sheet','linea en el material'],
    en:'Persistent lines across an extruded sheet can be associated with dirty die lips, buildup or contamination in the die, die-gap nonuniformity, or downstream cooling/tension effects. First determine whether the line tracks a fixed cross-machine position; a fixed position often points upstream toward the die or cooling/contact geometry.',
    es:'Líneas persistentes en un sheet extruido pueden relacionarse con labios del die sucios, buildup/contaminación dentro del die, gap desigual o efectos downstream de enfriamiento/tensión. Primero mira si la línea permanece en la misma posición de lado a lado; una posición fija muchas veces apunta upstream hacia die o geometría de enfriamiento/contacto.'
  },
  {
    id:'cooling',
    title:{en:'Cooling and chill rolls',es:'Enfriamiento y chill rolls'},
    keys:['cooling roll','chill roll','quench','cooling water','roll temperature','enfriamiento','rodillo frio','agua de enfriamiento','temperatura del roll'],
    en:'Cooling controls how quickly the extrudate freezes into its final dimensions. Uneven or unstable cooling can create dimensional, appearance or web-handling problems. Useful checks include roll temperature, water flow, contact, roll surface condition and whether line speed changed. Cooling changes can have delayed effects because the polymer does not conduct heat quickly.',
    es:'El enfriamiento controla qué tan rápido el extrudado se fija en sus dimensiones finales. Enfriamiento desigual o inestable puede crear problemas de dimensión, apariencia o manejo del web. Revisa temperatura de rolls, flujo de agua, contacto, condición de la superficie y cambios de line speed. Los efectos pueden tardar porque el polímero conduce calor lentamente.'
  },
  {
    id:'winding-tension',
    title:{en:'Winding tension and roll quality',es:'Tensión de winding y calidad del rollo'},
    keys:['winding tension','web tension','roll hardness','winder tension','tension roll','tension del winder','tension del web','dureza del rollo'],
    en:'Wound-roll quality depends on the combination of web tension, nip pressure and winding torque. Too soft can allow out-of-round rolls; too tight can exaggerate thickness defects or blocking. Good winding generally starts with a firm core foundation and then controls tension/nip/torque as roll diameter builds. Use the winder recipe approved for that product.',
    es:'La calidad del rollo depende de la combinación de web tension, nip pressure y winding torque. Muy flojo puede producir rollos out-of-round; demasiado apretado puede exagerar defectos de espesor o blocking. Un buen winding empieza con una base firme en el core y controla tensión/nip/torque conforme crece el diámetro. Usa la receta aprobada del winder para ese producto.'
  },
  {
    id:'telescoping-dishing',
    title:{en:'Telescoping / dishing rolls',es:'Rollos telescoped / dished'},
    keys:['telescoping','telescope roll','dishing','dish roll','roll out of round','rollo telescopiado','rollo se abre','rollo dished','fuera de redondo'],
    en:'Telescoping or dishing is often connected to an unsuitable roll-hardness profile, web tension, nip/torque balance, poor alignment or cross-web thickness variation. If the defect grows with roll diameter, compare taper/tension behavior and whether one side of the web is consistently thicker or looser.',
    es:'Telescoping o dishing suele relacionarse con un perfil incorrecto de dureza del rollo, web tension, balance nip/torque, alineación o variación de espesor de lado a lado. Si el defecto aumenta conforme crece el rollo, compara taper/tension y revisa si un lado del web está consistentemente más grueso o más flojo.'
  },
  {
    id:'blocking',
    title:{en:'Film/sheet blocking',es:'Blocking del film/sheet'},
    keys:['blocking','film blocking','sheet sticking','layers sticking','material pegado en rollo','capas pegadas','se pega el rollo'],
    en:'Blocking means adjacent layers adhere too strongly. Possible contributors include excessive winding tightness, inadequate cooling, surface treatment/additive effects or too much residual heat. Check roll temperature and winding condition before assuming the extruder itself is the only cause.',
    es:'Blocking significa que las capas del rollo se pegan demasiado entre sí. Posibles causas incluyen winding demasiado apretado, enfriamiento insuficiente, efectos de tratamiento/aditivos o demasiado calor residual. Revisa temperatura del rollo y condición de winding antes de asumir que el extruder es la única causa.'
  },
  {
    id:'screw-barrel-wear',
    title:{en:'Screw and barrel wear',es:'Desgaste de screw y barrel'},
    keys:['screw wear','barrel wear','worn screw','worn barrel','desgaste tornillo','desgaste barrel','screw gastado','barril gastado'],
    en:'As screw/barrel clearance increases with wear, conveying, melting and pressure-building performance can deteriorate. Symptoms can include reduced output, unstable output, poor melt quality or needing more speed to achieve the same rate. Wear should be confirmed by proper inspection/measurement, not guessed from one process symptom.',
    es:'Cuando aumenta el clearance por desgaste de screw/barrel, puede empeorar el transporte, fusión y capacidad de generar presión. Síntomas posibles son menor output, output inestable, mala calidad de melt o necesitar más velocidad para lograr el mismo rate. El desgaste debe confirmarse con inspección/medición correcta, no adivinarse por un solo síntoma.'
  },
  {
    id:'motor-load',
    title:{en:'Motor load / amps',es:'Carga del motor / amps'},
    keys:['motor load','motor amps','extruder amps','torque','amp load','carga del motor','amperaje extruder','amps extruder','torque extruder'],
    en:'Motor load is a useful indicator of how hard the screw drive is working. It can change with throughput, material viscosity, temperature, screw condition and restrictions. A load trend is most useful when compared with screw speed, head pressure, melt temperature and output rather than interpreted by itself.',
    es:'Motor load indica qué tanto esfuerzo está haciendo el drive del tornillo. Puede cambiar con throughput, viscosidad del material, temperatura, condición del screw y restricciones. La tendencia de load sirve más cuando se compara con screw speed, head pressure, melt temperature y output, no por sí sola.'
  },
  {
    id:'output-rate',
    title:{en:'Output and production rate',es:'Output y rate de producción'},
    keys:['output rate','production rate','lbs per hour','lbs/hr','throughput','rate dropping','produccion por hora','libras por hora','produccion bajando'],
    en:'Extruder output is strongly related to screw speed and how consistently the screw is fed, but pressure, viscosity, temperature and downstream line conditions can change the actual delivered rate. A falling lbs/hr rate should be checked together with feed consistency, screw speed, motor load, head pressure, melt temperature and downtime/roll-change effects.',
    es:'El output del extruder está muy relacionado con screw speed y con qué tan consistentemente se alimenta el tornillo, pero presión, viscosidad, temperatura y condiciones downstream pueden cambiar el rate real. Si bajan las lbs/hr, compara alimentación, screw speed, motor load, head pressure, melt temperature y efectos de downtime/cambios de rollo.'
  },
  {
    id:'sheet-balance',
    title:{en:'Cross-web / winder balance',es:'Balance de sheet / winders'},
    keys:['sheet balance','winder balance','top sheet heavy','bottom sheet heavy','cross web','cross-web','balance de winders','top pesado','bottom pesado','diferencia winders'],
    en:'A consistent difference between Winder 1 and Winder 2 can indicate a cross-web thickness or flow-distribution imbalance. Repeated same-side heaviness is more meaningful than a single cut. Use the line’s approved die-adjustment method and verify the response on subsequent completed cuts instead of chasing every small fluctuation.',
    es:'Una diferencia consistente entre Winder 1 y Winder 2 puede indicar un desbalance de espesor o distribución de flujo de lado a lado. Que el mismo lado salga pesado en varios cortes es más significativo que un solo corte. Usa el método aprobado de ajuste del die y verifica la respuesta en cortes siguientes en vez de perseguir cada fluctuación pequeña.'
  },
  {
    id:'foam-general',
    title:{en:'Foam extrusion — general principles',es:'Extrusión de foam — principios generales'},
    keys:['foam extrusion','foam cell','cell size','foam density','blowing agent','isobutane','co2','espuma extruida','celda de foam','densidad foam','agente de expansion'],
    en:'In foam extrusion, melt condition, pressure, temperature, mixing and blowing-agent distribution all influence cell structure and density. Higher pressure can support finer cellular structure in some foam systems, but the correct operating window is formulation- and equipment-specific. Blowing agents such as hydrocarbons or CO₂ involve process and safety controls that must follow the plant SOP; the chat should not invent gas settings or bypass interlocks.',
    es:'En extrusión de foam, condición del melt, presión, temperatura, mezcla y distribución del blowing agent influyen en estructura de celda y densidad. En algunos sistemas, mayor presión puede ayudar a una estructura celular más fina, pero la ventana correcta depende de formulación y equipo. Blowing agents como hidrocarburos o CO₂ requieren controles de proceso y seguridad del SOP; el chat no debe inventar settings de gas ni bypass de interlocks.'
  },
  {
    id:'rheology',
    title:{en:'Resin viscosity and rheology',es:'Viscosidad y reología de la resina'},
    keys:['viscosity','rheology','melt flow','mfi','mfr','resin change','material viscosity','viscosidad','reologia','flujo de melt','cambio de resina'],
    en:'Polymer viscosity is not constant: it changes with temperature and shear rate, and different resin lots or grades can behave differently. That is why the same machine settings may not always produce identical pressure or output. When behavior changes after a resin or lot change, compare material identification, melt temperature, pressure, motor load and actual output before making large adjustments.',
    es:'La viscosidad del polímero no es constante: cambia con temperatura y shear rate, y diferentes lotes o grados de resina pueden comportarse distinto. Por eso los mismos settings no siempre producen exactamente la misma presión u output. Si cambia el comportamiento después de cambiar resina/lote, compara identificación del material, melt temperature, pressure, motor load y output real antes de hacer ajustes grandes.'
  },
  {
    id:'changeover',
    title:{en:'Product changeover',es:'Cambio de producto'},
    keys:['changeover principle','product change','changing product','cambio de producto','cambiar producto','principio de cambio'],
    en:'During a product changeover, the previous steady-state settings are only a starting reference. A good transition uses the known target for the destination product, the last reliable actual BW/output, current S-Wrap and comparable learned history. After the change, judge the new run from completed cuts for the new product rather than mixing old-product trend data into the prediction.',
    es:'Durante un cambio de producto, los settings anteriores son solamente una referencia inicial. Una buena transición usa el target del producto destino, el último BW/output confiable, S-Wrap actual y aprendizaje comparable. Después del cambio, evalúa la nueva corrida con cortes completados del producto nuevo y no mezcles la tendencia del producto anterior en la predicción.'
  },
  {
    id:'basis-weight',
    title:{en:'Basis Weight in this app',es:'Basis Weight en esta app'},
    keys:['basis weight meaning','what is bw','bw meaning','basis weight formula','que es basis weight','que es bw','formula bw','peso base'],
    en:'In Industrial IA, Basis Weight is calculated from roll weight, roll length and selected mandrel/width using the plant-configured BW factor. The app compares Actual BW with Target BW, uses the two winders to calculate the cut average, and applies the line tolerance rules before recommending an S-Wrap change.',
    es:'En Industrial IA, el Basis Weight se calcula con peso del rollo, longitud y mandrel/ancho seleccionado usando el factor BW configurado para la planta. La app compara Actual BW con Target BW, usa los dos winders para calcular el promedio del corte y aplica las tolerancias de la línea antes de recomendar un cambio de S-Wrap.'
  },
  {
    id:'swrap',
    title:{en:'S-Wrap and BW control',es:'S-Wrap y control de BW'},
    keys:['s-wrap','swrap','s wrap','what does s-wrap do','que hace el swrap','para que sirve swrap','velocidad s-wrap'],
    en:'In this line logic, S-Wrap is the downstream speed variable used to correct Basis Weight. Industrial IA uses the measured BW, target BW and current S-Wrap to calculate a suggested new value, then its adaptive learning can refine that recommendation from comparable accepted results. Preventive Trend Predictor changes are separate from the lower corrective logic.',
    es:'En la lógica de esta línea, S-Wrap es la velocidad downstream que se usa para corregir Basis Weight. Industrial IA usa BW medido, Target BW y S-Wrap actual para calcular un valor nuevo sugerido; después el adaptive learning puede afinar esa recomendación con resultados comparables aceptados. Los cambios preventivos del Trend Predictor son separados de la lógica correctiva de abajo.'
  },
  {
    id:'process-monitoring',
    title:{en:'What to monitor on an extruder',es:'Qué monitorear en un extruder'},
    keys:['what should i monitor','process monitoring','extruder variables','key variables','que monitorear','variables del extruder','parametros importantes'],
    en:'For a stable extrusion process, the most useful variables to trend together are material feed, screw speed, motor load, barrel and melt temperature, head/die pressure, output rate, product BW/thickness, cooling conditions and downstream speed/tension. One number alone rarely explains the whole process; the relationship and timing between variables is more useful.',
    es:'Para un proceso estable conviene observar juntas estas variables: alimentación de material, screw speed, motor load, temperaturas de barrel y melt, head/die pressure, output rate, BW/espesor del producto, condiciones de cooling y velocidad/tensión downstream. Un solo número rara vez explica todo; la relación y el orden en que cambian las variables es más útil.'
  },
  {
    id:'troubleshooting-method',
    title:{en:'Extrusion troubleshooting method',es:'Método para diagnosticar extrusión'},
    keys:['troubleshoot extruder','diagnose extrusion','find root cause','root cause','como diagnosticar','como encontrar problema','diagnostico extruder','causa raiz'],
    en:'A practical troubleshooting sequence is: 1) define the defect or unstable variable, 2) identify when it started and what changed, 3) compare feed, speed, load, melt temperature, pressure, output/BW and downstream conditions, 4) determine which variable moved first, 5) change only one safe/approved variable at a time, and 6) wait for the process response and record the result. That prevents chasing symptoms.',
    es:'Una secuencia práctica es: 1) define el defecto o variable inestable, 2) identifica cuándo empezó y qué cambió, 3) compara feed, speed, load, melt temperature, pressure, output/BW y condiciones downstream, 4) determina qué variable se movió primero, 5) cambia solo una variable segura/aprobada a la vez y 6) espera la respuesta del proceso y registra el resultado. Así evitas perseguir síntomas.'
  },
  {
    id:'pressure-instrument',
    title:{en:'Pressure transducer basics',es:'Conceptos del pressure transducer'},
    keys:['pressure transducer','pressure sensor','transducer reading wrong','pressure reading wrong','sensor de presion','transducer de presion','lectura de presion incorrecta'],
    en:'A melt-pressure transducer is a process and safety instrument, so a strange reading should not be treated automatically as a true process change. Compare it with the historical trend and other variables, check for known instrumentation issues, and follow the approved calibration/maintenance procedure. Never exceed the rated process pressure to test a sensor.',
    es:'Un melt-pressure transducer es un instrumento de proceso y seguridad, así que una lectura extraña no debe asumirse automáticamente como un cambio real del proceso. Compárala con la tendencia histórica y otras variables, revisa posibles problemas de instrumentación y sigue el procedimiento aprobado de calibración/mantenimiento. Nunca excedas la presión permitida para probar un sensor.'
  },
  {
    id:'safety-interlocks',
    title:{en:'Extruder safety and interlocks',es:'Seguridad e interlocks del extruder'},
    keys:['interlock','e-stop','emergency stop','safety circuit','lockout','loto','bypass safety','bypass interlock','interlock de seguridad','paro de emergencia','bloqueo'],
    en:'Extrusion equipment combines rotating machinery, hot polymer and potentially high melt pressure. E-Stops and safety interlocks exist to protect people and equipment. Do not bypass or defeat them. For lockout, guards, pressure relief, startup/shutdown, purging, die opening or mechanical maintenance, use the site-specific SOP and trained-personnel procedure.',
    es:'El equipo de extrusión combina maquinaria rotativa, polímero caliente y posiblemente alta presión de melt. E-Stops e interlocks existen para proteger personas y equipo. No se deben bypass ni anular. Para lockout, guards, alivio de presión, startup/shutdown, purging, abrir die o mantenimiento mecánico, usa el SOP específico de la planta y personal entrenado.'
  }
]);


// Alias used by the chat router. General equipment/process questions default here because
// this plant uses Davis-Standard extrusion equipment.
window.DAVIS_STANDARD_KNOWLEDGE = window.EXTRUSION_KNOWLEDGE;

// Plant-specific process relationships supplied by the operators. These are intentionally
// separate from manufacturer/general knowledge and from the S-Wrap/BW control optimizer.
window.PLANT_PROCESS_KNOWLEDGE = Object.freeze([
  {
    id:'tandem-primary-secondary',source:'plant+davis',
    title:{en:'Primary and Secondary extruders',es:'Extruder primario y secundario'},
    keys:['primary secondary','primary barrel secondary barrel','primary extruder secondary extruder','primario secundario','barrel primario','barrel secundario','que hace el primary','que hace el secondary'],
    en:'This is a tandem foam process. The Primary is the plasticating/mixing extruder: it feeds, melts, mixes and pumps the polymer toward the transfer section. The Secondary is the larger, slow cooling extruder: it homogenizes the melt and removes heat before the die. The same production flow passes through both extruders; their lb/hr values are not added together.',
    es:'Este es un proceso tandem de foam. El Primary es el extruder que plastifica y mezcla: alimenta, funde, mezcla y bombea el polímero hacia la transferencia. El Secondary es el extruder grande y lento de enfriamiento: homogeniza el melt y le quita calor antes del die. El mismo flujo de producción pasa por los dos extruders; las lb/hr de Primary y Secondary no se suman.'
  },
  {
    id:'primary-secondary-pressure-coupling',source:'plant',
    title:{en:'Primary/Secondary pressure coupling',es:'Acoplamiento de presión Primary/Secondary'},
    keys:['lower secondary pressure','raise secondary pressure','secondary unchanged primary','primary pressure 5500','high pressure shutdown','bajar secondary presion','subir secondary presion','secondary sin primary','presion 5500','shutdown 5500','coordinar primary secondary'],
    en:'Plant operating rule: Primary and Secondary must be treated as a coordinated flow pair. Lowering Secondary while leaving Primary unchanged can back up flow and drive Primary Pressure upward; the plant high-pressure shutdown is 5,500. Raising Secondary while leaving Primary unchanged can pull material faster and drive Primary Pressure downward. Therefore Viejito must not issue a Secondary-only speed recommendation: a line-speed/BW recommendation must include coordinated Primary RPM + Secondary RPM and should use learned Primary Pressure when enough real samples exist.',
    es:'Regla operativa de planta: Primary y Secondary se deben tratar como un par de flujo coordinado. Bajar Secondary dejando Primary igual puede acumular flujo y subir la Primary Pressure; el high-pressure shutdown de planta es 5,500. Subir Secondary dejando Primary igual puede jalar material más rápido y bajar la Primary Pressure. Por eso Viejito no debe dar una recomendación de velocidad solo para Secondary: una recomendación de velocidad/BW debe incluir Primary RPM + Secondary RPM coordinados y usar la Primary Pressure aprendida cuando ya existan suficientes muestras reales.'
  },
  {
    id:'coordinated-speed-heat-rule',source:'plant',
    title:{en:'Coordinated speed change with Secondary Heat',es:'Cambio de velocidad coordinado con Secondary Heat'},
    keys:['maintain bw speed','same bw lower speed','same bw increase speed','bajar velocidad mismo bw','subir velocidad mismo bw','secondary heat recommendation','heat with speed change','friction heat recommendation'],
    en:'When line speed changes and the goal is to keep the same BW, Viejito should coordinate three process setpoints as one recommendation: Primary RPM, Secondary RPM and a Secondary Heat starting value. The starting Heat follows learned line data when available; otherwise the plant examples near 6 RPM / Heat ~230 and 12.5 RPM / Heat ~160 provide an interpolation guide. Actual melt (target 300–305 on the plant display), motor load and pressure remain authoritative after the change.',
    es:'Cuando cambia la velocidad de línea y la meta es conservar el mismo BW, Viejito debe coordinar tres setpoints como una sola recomendación: Primary RPM, Secondary RPM y un Secondary Heat inicial. El Heat inicial debe usar datos aprendidos de la línea cuando existan; si todavía no hay suficientes, los ejemplos de planta cerca de 6 RPM / Heat ~230 y 12.5 RPM / Heat ~160 sirven como guía de interpolación. Después del cambio mandan el melt real (target 300–305 en el display), motor load y presión.'
  },
  {
    id:'primary-rpm-plant',source:'plant',
    title:{en:'Primary RPM — plant operating knowledge',es:'Primary RPM — conocimiento de planta'},
    keys:['primary rpm','primary speed','primary at','rpm primario','velocidad primario','primary 110','primary 128','primary 60'],
    en:'Plant production knowledge: Primary normally operates about 60–128 RPM. Higher Primary RPM generally raises line throughput and can also raise mechanical/shear energy. Diagnose Primary changes together with Secondary RPM, output lb/hr, melt, pressure and motor load rather than from RPM alone.',
    es:'Conocimiento de producción de planta: el Primary normalmente trabaja aproximadamente entre 60 y 128 RPM. Subir Primary normalmente aumenta el throughput de la línea y también puede aumentar la energía mecánica/shear. Para diagnosticar un cambio de Primary hay que verlo junto con Secondary RPM, output lb/hr, melt, presión y motor load, no solamente el RPM.'
  },
  {
    id:'secondary-rpm-plant',source:'plant',
    title:{en:'Secondary RPM and friction heat',es:'Secondary RPM y friction heat'},
    keys:['secondary rpm','secondary speed','friction heat','secondary 12.5','secondary 13','secondary 10','secondary 6','rpm secundario','velocidad secundario','calor por friccion','friction heat secondary'],
    en:'Plant production knowledge: Secondary normally operates about 5–13 RPM. Around and above about 12.5 RPM, friction/shear heat rises sharply and cooling capacity becomes the limiting concern. The Secondary should not be treated like a simple output screw: its speed, residence time, cooling, melt and motor load must be considered together.',
    es:'Conocimiento de producción de planta: el Secondary normalmente trabaja aproximadamente entre 5 y 13 RPM. Alrededor de 12.5 RPM y por encima, el friction/shear heat aumenta fuertemente y la capacidad de enfriamiento se vuelve la preocupación principal. El Secondary no se debe tratar como un simple tornillo de output: su RPM, tiempo de residencia, cooling, melt y motor load se tienen que analizar juntos.'
  },
  {
    id:'secondary-heat-load-high-speed',source:'plant',
    title:{en:'Secondary Heat near 12.5 RPM',es:'Secondary Heat cerca de 12.5 RPM'},
    keys:['12.5 secondary heat','secondary heat 160','secondary at 12.5','load at 12.5','secundario 12.5 heat','heat 160','secondary load high'],
    en:'Plant example: when Secondary is around 12.5 RPM, Secondary Heat is commonly around 160 on the plant display. Reducing Secondary Heat too aggressively can make the melt more viscous and raise motor load enough to risk a trip/stop or excessive motor stress. Treat 160 as a plant example, not a universal Davis-Standard setpoint.',
    es:'Ejemplo de planta: cuando el Secondary está alrededor de 12.5 RPM, el Secondary Heat normalmente está cerca de 160 en el display de planta. Bajar demasiado el Secondary Heat puede aumentar la viscosidad y subir el motor load hasta arriesgar un trip/paro o demasiado esfuerzo del motor. El 160 es un ejemplo de esta planta, no un setpoint universal de Davis-Standard.'
  },
  {
    id:'secondary-heat-load-low-speed',source:'plant',
    title:{en:'Secondary Heat at low RPM',es:'Secondary Heat con RPM bajo'},
    keys:['secondary 6 heat','secondary heat 230','secondary at 6','low secondary rpm','secundario 6','heat 230','secondary cooling too much'],
    en:'Plant example: at a low Secondary speed such as about 6 RPM, residence time is longer and the polymer can cool too much. As viscosity rises, motor load can climb. Operators may compensate by raising Secondary Heat, for example toward about 230 on the plant display, so the melt does not become excessively cold. Treat 230 as a plant example, not a universal setpoint.',
    es:'Ejemplo de planta: con Secondary bajo, por ejemplo cerca de 6 RPM, el material permanece más tiempo y se puede enfriar demasiado. Cuando aumenta la viscosidad, también puede subir el motor load. Los operadores pueden compensar subiendo Secondary Heat, por ejemplo hacia 230 en el display de planta, para que el melt no se enfríe demasiado. El 230 es un ejemplo de esta planta, no un setpoint universal.'
  },
  {
    id:'plant-melt-window',source:'plant',
    title:{en:'Plant melt operating window',es:'Ventana de melt de planta'},
    keys:['melt 300','melt 305','melt 300 305','melt high','melt low','melt alto','melt bajo','temperatura melt planta'],
    en:'Plant operating knowledge: the desired melt reading is 300–305 on the plant display. Above that window, roll quality becomes unacceptable. Below that window, the plastic loses stretchability, can break at the die and can stop the line. The temperature unit has not been encoded because it has not yet been explicitly confirmed. Use the plant display/SOP unit.',
    es:'Conocimiento operativo de planta: el melt deseado es 300–305 en el display de planta. Por encima de esa ventana, la calidad de los rollos deja de ser aceptable. Por debajo, el plástico pierde estirabilidad, puede romperse en el die y parar la línea. La unidad de temperatura no se etiqueta porque todavía no se ha confirmado explícitamente; usa la unidad del display/SOP de planta.'
  },
  {
    id:'secondary-friction-cooling-troubleshooting',source:'plant+davis',
    title:{en:'Secondary friction heat / cooling troubleshooting',es:'Troubleshooting de friction heat / cooling del Secondary'},
    keys:['cannot cool melt','melt will not cool','secondary too hot','friction heat high','no puedo enfriar melt','melt no baja','secondary caliente','friction heat alto'],
    en:'For this tandem line, check Secondary RPM, Secondary Heat, motor load, melt, cooling response and pressure together. Near the upper Secondary range, friction/shear heat can outrun cooling. At low Secondary RPM, long residence time can over-cool the melt and raise load unless heat is increased. Do not respond to a hot/cold symptom by changing one temperature blindly; identify whether shear heat, residence cooling, viscosity or load is driving the condition.',
    es:'En esta línea tandem hay que revisar juntos Secondary RPM, Secondary Heat, motor load, melt, respuesta del cooling y presión. Cerca del rango alto del Secondary, el friction/shear heat puede superar la capacidad de enfriamiento. Con Secondary bajo, el largo tiempo de residencia puede enfriar demasiado el melt y subir el load si no se compensa con heat. No respondas a un síntoma caliente/frío cambiando una temperatura a ciegas; identifica si manda el shear heat, residence cooling, viscosidad o load.'
  },
  {
    id:'tandem-output',source:'davis',
    title:{en:'Output through a tandem line',es:'Output a través de una línea tandem'},
    keys:['primary output secondary output','output primary secondary','lbs hour primary secondary','output primario secundario','lb hr primario secundario','throughput tandem'],
    en:'In a stable tandem line, essentially the same mass flow travels through the Primary and Secondary. The Secondary does not add another independent lb/hr stream. Davis-Standard publishes nominal tandem-system output by extruder-size pair, and technical tandem-foam literature notes that Secondary cooling performance often becomes the rate-limiting operation. Actual plant output must be learned from the plant’s real RPM/output history.',
    es:'En una línea tandem estable, prácticamente el mismo mass flow pasa por Primary y Secondary. El Secondary no agrega otro stream independiente de lb/hr. Davis-Standard publica output nominal del sistema tandem según el par de tamaños, y literatura técnica de tandem foam indica que la capacidad de cooling del Secondary muchas veces limita el rate máximo. El output real de esta planta se debe aprender del historial real RPM/output.'
  },
  {
    id:'secondary-pressure-gradient',source:'davis',
    title:{en:'Secondary pressure gradient and heat',es:'Pressure gradient del Secondary y heat'},
    keys:['secondary pressure gradient','secondary inlet outlet pressure','secondary builds pressure','pressure secondary','gradiente presion secondary','presion entrada salida secondary'],
    en:'Tandem-foam literature describes the cooling extruder as sensitive to axial pressure gradient. Using the Secondary to build significant die pressure can reduce its specific output and increase viscous energy dissipation. A useful troubleshooting comparison is Secondary inlet pressure versus outlet pressure together with RPM, melt and load. Machine pressure limits remain plant/manual-specific.',
    es:'La literatura de tandem foam describe al cooling extruder como sensible al pressure gradient axial. Usar el Secondary para generar una parte importante de la presión del die puede reducir su specific output y aumentar la energía disipada por viscosidad. Para troubleshooting conviene comparar presión de entrada y salida del Secondary junto con RPM, melt y load. Los límites de presión siguen siendo específicos del manual/planta.'
  },
  {
    id:'die-melt-vs-setpoint',source:'davis',
    title:{en:'Actual melt at the die vs heater setpoint',es:'Melt real en el die vs setpoint'},
    keys:['die melt','melt at die','die temperature melt temperature','die heat melt','melt del die','temperatura die vs melt','melt real die'],
    en:'The die/heater-zone setpoint is not the same thing as the actual polymer melt temperature. Davis-Standard process controls treat product/melt temperature as its own key monitored variable because viscosity depends strongly on actual melt temperature. Diagnose roll quality from the actual melt reading and process context, not from heater setpoint alone.',
    es:'El setpoint de los heaters/zones del die no es lo mismo que la temperatura real del polímero. Davis-Standard trata product/melt temperature como una variable de monitoreo separada porque la viscosidad depende fuertemente del melt real. Diagnostica la calidad del rollo usando la lectura real de melt y el contexto del proceso, no solamente el setpoint del heater.'
  }
]);
