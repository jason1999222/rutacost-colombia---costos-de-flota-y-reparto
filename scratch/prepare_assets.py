import os
import json

BUILD_DIR = r"C:\Users\lenovo\Downloads\Himnario_App_Build"
ASSETS_DIR = os.path.join(BUILD_DIR, "assets")
os.makedirs(ASSETS_DIR, exist_ok=True)

# Load Reina Valera 1960
rvr_path = os.path.join(BUILD_DIR, "data", "rvr1960.json")
with open(rvr_path, "r", encoding="utf-8") as f:
    bible_books = json.load(f)

print(f"Loaded {len(bible_books)} Bible books.")

# Prepare rich hymnal data (Himnos and Coros)
himnos_data = [
    {
        "id": "H1", "num": 1, "type": "himno", "title": "Cantaré la bella historia",
        "stanzas": [
            "Cantaré la bella historia que Jesús murió por mí;\ncómo allá en el Calvario dio su sangre carmesí.",
            "CORO:\n¡Cantaré la bella historia\nde Jesús mi Salvador,\ny con santos en la gloria\na su nombre daré honor!",
            "Cristo vino a rescatarme, vil, perdido me encontró;\ncon su mano tierna y fuerte al redil me condujo.",
            "Mis heridas y dolores con paciencia Él sanó;\nen sus brazos amorosos tiernamente me llevó."
        ]
    },
    {
        "id": "H2", "num": 2, "type": "himno", "title": "A Dios sea la gloria",
        "stanzas": [
            "¡A Dios sea la gloria, pues grande es su amor!\nPor darnos a su Hijo, murió el Salvador;\nsu vida rindió por la culpa expiar,\ny la puerta del cielo a todos abrir.",
            "CORO:\n¡Alabemos a Dios! Que su voz toda la tierra oiga hoy.\n¡Alabemos a Dios! De gozo cantemos con fervor.\nVenid por el Hijo al Padre eternal,\ny honor demos todos al Rey inmortal.",
            "¡Oh gracia preciosa de redención!\nPara todo creyente que pide perdón;\nel más vil pecador que a Cristo creerá,\nen ese momento perdón hallará.",
            "Grandes cosas Él hizo, nos dio salvación;\ny grande es el gozo que llena el corazón;\nmas alto, sublime y completo será\nel gozo con Cristo en la gloria eternal."
        ]
    },
    {
        "id": "H3", "num": 3, "type": "himno", "title": "Santo, Santo, Santo",
        "stanzas": [
            "¡Santo! ¡Santo! ¡Santo! Señor Omnipotente,\nsiempre el labio mío loores te dará;\n¡Santo! ¡Santo! ¡Santo! Te adoro reverente,\nDios en tres Personas, bendita Trinidad.",
            "¡Santo! ¡Santo! ¡Santo! En numeroso coro,\nsantos escogidos te adoran sin cesar;\nde alegría llenos y sus coronas de oro\nrinden ante el trono y el cristalino mar.",
            "¡Santo! ¡Santo! ¡Santo! La inmensa muchedumbre,\nde ángeles que cumplen tu santa voluntad,\nante ti se postra bañada de tu lumbre,\nante ti que has sido, que eres y serás.",
            "¡Santo! ¡Santo! ¡Santo! Por más que estés velado,\ne imposible sea tu gloria contemplar;\nsanto tú eres solo y nada hay a tu lado,\nen poder perfecto, pureza y caridad."
        ]
    },
    {
        "id": "H4", "num": 4, "type": "himno", "title": "Grande gozo hay en mi alma",
        "stanzas": [
            "Grande gozo hay en mi alma hoy,\npues Jesús conmigo está;\ny su paz, que ya gozando estoy,\npor siempre durará.",
            "CORO:\n¡Grande gozo, cuán hermoso!\nPaso todo el tiempo bien feliz;\nporque veo de Cristo la sonriente faz,\ngrande gozo siento en mí.",
            "Hay un canto en mi alma hoy,\nde alabanza a mi Señor;\nporque en Cristo libre y salvo soy,\ngozando de su amor.",
            "Paz divina hay en mi alma hoy,\nporque Cristo me salvó;\nlas cadenas rotas ya están,\nsu gracia me libró."
        ]
    },
    {
        "id": "H5", "num": 5, "type": "himno", "title": "Sublime gracia",
        "stanzas": [
            "Sublime gracia del Señor,\nque a un vil pecador salvó;\nfui ciego ayer, mas hoy veo yo,\nperdido fui, mas me halló.",
            "Su gracia me enseñó a temer,\nmis dudas ahuyentó;\n¡oh cuán preciosa fue a mi ser\ncuando Él me perdonó!",
            "En los peligros y aflicción\nque yo he tenido aquí,\nsu gracia siempre me libró\ny me guiará feliz.",
            "Y cuando en Sion por siglos mil\nbrillando esté cual sol,\njamás cesaré de alabar\nal Santo y fiel Señor."
        ]
    },
    {
        "id": "H6", "num": 6, "type": "himno", "title": "Cuán grande es Él",
        "stanzas": [
            "Señor, mi Dios, al contemplar los cielos,\nel firmamento y las estrellas mil;\nal oír tu voz en los potentes truenos\ny ver brillar al sol en su cenit.",
            "CORO:\nMi corazón entona la canción:\n¡Cuán grande es Él! ¡Cuán grande es Él!\nMi corazón entona la canción:\n¡Cuán grande es Él! ¡Cuán grande es Él!",
            "Al recorrer los montes y los valles\ny ver las bellas flores al pasar;\nal escuchar el canto de las aves\ny el murmurar del claro manantial.",
            "Cuando recuerdo del amor divino,\nque desde el cielo al Salvador envió;\naquel Jesús que por salvarme vino,\ny en una cruz por mí murió y triunfó.",
            "Cuando el Señor me llame a su presencia,\nal dulce hogar, al cielo de esplendor;\nle adoraré cantando la grandeza\nde su poder y su infinito amor."
        ]
    },
    {
        "id": "H7", "num": 7, "type": "himno", "title": "En la cruz",
        "stanzas": [
            "Me hirió el pecado, fui a Jesús,\nmostréle mi dolor;\nperdido, errante, vi su luz,\nbendíjome en su amor.",
            "CORO:\nEn la cruz, en la cruz, do primero vi la luz,\ny las manchas de mi alma yo lavé;\nfue allí por fe do vi a Jesús,\ny siempre feliz con Él seré.",
            "Sobre una cruz mi Salvador\nsu sangre derramó,\npor este pobre pecador\na quien así salvó.",
            "Venció la muerte con poder,\ny al cielo se exaltó;\nconfiar en Él es mi placer,\nmorir no temo yo."
        ]
    },
    {
        "id": "H8", "num": 8, "type": "himno", "title": "Firmes y adelante",
        "stanzas": [
            "Firmes y adelante, huestes de la fe,\nsin temor alguno, que Jesús nos ve.\nJefe soberano, Cristo al frente va;\ny la regia enseña tremolando está.",
            "CORO:\n¡Firmes y adelante, huestes de la fe,\nsin temor alguno, que Jesús nos ve!",
            "Al sagrado nombre de nuestro adalid,\ntiembla el enemigo y huye de la lid.\nNuestra es la victoria, dad a Dios loor,\ny oiga el orbe entero cánticos de amor.",
            "Muévase potente la Iglesia de Dios;\nde los ya gloriosos marchamos en pos;\nsomos solo un cuerpo, y uno es el amor,\nuna la esperanza, y uno es el Señor."
        ]
    },
    {
        "id": "H9", "num": 9, "type": "himno", "title": "Castillo fuerte es nuestro Dios",
        "stanzas": [
            "Castillo fuerte es nuestro Dios,\ndefensa y buen escudo;\ncon su poder nos librará\nen todo trance agudo.",
            "Con furia y con afán\nacósanos Satán;\npor armas hace uso\nde astucia y de rencor;\nen tierra no hay su igual.",
            "Luchar debemos con valor,\nconfiando en su palabra;\nJesús triunfó del tentador,\nsu diestra nos ampara."
        ]
    },
    {
        "id": "H10", "num": 10, "type": "himno", "title": "Lluvias de gracia",
        "stanzas": [
            "Dios nos ha dado promesa:\nlluvias de gracia enviaré;\ndones que os den fortaleza;\ngozoso yo las derramaré.",
            "CORO:\nLluvias de gracia,\nlluvias pedimos, Señor;\nmándanos lluvias copiosas,\nlluvias del Consolador.",
            "Cristo nos dio la promesa\ndel Santo Consolador;\npaz y perdón nos confiere,\nllenos de gracia y amor.",
            "Manda la lluvia, Señor;\ngracias te damos por fe;\nhaz que en tu santa presencia\nsiempre alabándote esté."
        ]
    },
    {
        "id": "H11", "num": 11, "type": "himno", "title": "Dulce comunión",
        "stanzas": [
            "¡Dulce comunión la que gozo ya\nen los brazos de mi Salvador!\n¡Qué gran bendición en su paz me da!\n¡Oh, yo siento en mí su tierno amor!",
            "CORO:\nLibre, salvo, del pecado y del temor;\nlibre, salvo, en los brazos de mi Salvador.",
            "¡Cuán dulce es andar junto a mi Señor\nen los brazos de mi Salvador!\nCada día más siento su favor;\nÉl derrama en mí su gran amor."
        ]
    },
    {
        "id": "H12", "num": 12, "type": "himno", "title": "Tu fidelidad es grande",
        "stanzas": [
            "Tu fidelidad es grande,\ntu fidelidad incomparable es;\nnadie como tú, bendito Dios,\ngrande es tu fidelidad.",
            "Nuevas son cada mañana,\ntus bondades nunca se acaban;\ntodo lo que necesito me das,\ngrande es tu fidelidad."
        ]
    },
    {
        "id": "H13", "num": 13, "type": "himno", "title": "Todas las promesas",
        "stanzas": [
            "Todas las promesas del Señor Jesús\nson apoyo fiel de nuestra fe y salud;\nsiempre cantaremos de su gran virtud,\nconfiando en sus promesas.",
            "CORO:\nFirmes, firmes,\nconfiando en las promesas de Jesús;\nfirmes, firmes,\nconfiando en las promesas de su amor.",
            "Todas sus promesas para siempre son,\ngozan los creyentes plena redención;\npaz, consolación y santificación,\nconfiando en sus promesas."
        ]
    },
    {
        "id": "H14", "num": 14, "type": "himno", "title": "Cuando allá se pase lista",
        "stanzas": [
            "Cuando la trompeta suene en aquel día final,\ny el alba eterna rompa en claridad;\ncuando las naciones salvas a su patria celestial\nse reúnan, y allá se pase lista, estaré.",
            "CORO:\nCuando allá se pase lista,\ncuando allá se pase lista,\ncuando allá se pase lista,\na mi nombre yo feliz responderé.",
            "En aquel día sin nieblas, en que muerte ya no habrá,\ny su gloria el Salvador nos mostrará;\ncuando los salvados canten alabanzas a Jehová,\ny que sea pasada lista, yo estaré."
        ]
    },
    {
        "id": "H15", "num": 15, "type": "himno", "title": "Hay poder en Jesús",
        "stanzas": [
            "¿Quieres ser libre de culpa y perdón?\nTan solo hay poder en Jesús;\n¿Quieres vencer toda vil tentación?\nTan solo hay poder en Jesús.",
            "CORO:\nHay poder, poder, sin igual poder,\nen Jesús, que murió;\nhay poder, poder, sin igual poder,\nen la sangre que Él vertió.",
            "¿Quieres ser limpio de toda maldad?\nTan solo hay poder en Jesús;\nÉl te da gozo, pureza y bondad,\ntan solo hay poder en Jesús."
        ]
    }
]

coros_data = [
    {
        "id": "C1", "num": 1, "type": "coro", "title": "Cantad alegres a Dios",
        "stanzas": [
            "Cantad alegres a Dios, habitantes de toda la tierra,\nservid a Jehová con alegría,\nvenid ante su presencia con regocijo.",
            "Reconoced que Jehová es Dios;\nÉl nos hizo, y no nosotros a nosotros mismos;\npueblo suyo somos, y ovejas de su prado.",
            "Entrad por sus puertas con acción de gracias,\npor sus atrios con alabanza;\nalabadle, bendecid su nombre.\nPorque Jehová es bueno; para siempre es su misericordia,\ny su verdad por todas las generaciones."
        ]
    },
    {
        "id": "C2", "num": 2, "type": "coro", "title": "Alabaré a mi Señor",
        "stanzas": [
            "// Alabaré, alabaré, alabaré, alabaré,\nalabaré a mi Señor //",
            "Juan vio el número de los redimidos\ny todos alababan al Señor;\nunos oraban, otros cantaban,\npero todos alababan al Señor.",
            "Todos unidos, alegres cantamos\nglorias y alabanzas al Señor.\n¡Gloria al Padre, gloria al Hijo,\ny gloria al Espíritu de amor!"
        ]
    },
    {
        "id": "C3", "num": 3, "type": "coro", "title": "Yo me alegré con los que me decían",
        "stanzas": [
            "Yo me alegré con los que me decían:\nA la casa de Jehová iremos.\nNuestros pies estuvieron dentro de tus puertas, oh Jerusalén.",
            "Jerusalén, que se ha edificado\ncomo una ciudad que está bien unida entre sí.\nY allá subieron las tribus, las tribus de Jah,\nconforme al testimonio dado a Israel,\npara alabar el nombre de Jehová."
        ]
    },
    {
        "id": "C4", "num": 4, "type": "coro", "title": "Jehová es mi pastor",
        "stanzas": [
            "Jehová es mi pastor, nada me faltará;\nen lugares de delicados pastos me hará descansar;\njunto a aguas de reposo me pastoreará.",
            "Confortará mi alma; me guiará por sendas de justicia\npor amor de su nombre.\nAunque ande en valle de sombra de muerte,\nno temeré mal alguno, porque tú estarás conmigo;\ntu vara y tu cayado me infundirán aliento."
        ]
    },
    {
        "id": "C5", "num": 5, "type": "coro", "title": "Los que esperan en Jehová",
        "stanzas": [
            "// Los que esperan, los que esperan en Jehová //\n// nuevas fuerzas tendrán, nuevas fuerzas tendrán,\nvolarán con poder, volarán con poder //",
            "Correrán y no se cansarán,\ncaminarán y no se fatigarán;\ncomo las águilas, como las águilas,\nsus alas levantarán."
        ]
    },
    {
        "id": "C6", "num": 6, "type": "coro", "title": "Estamos de fiesta con Jesús",
        "stanzas": [
            "Estamos de fiesta con Jesús;\nal cielo queremos ir;\nestamos sentados a su mesa,\ny es Cristo quien va a servir.",
            "// Poderoso es nuestro Dios,\npoderoso es nuestro Dios //\nÉl salva, Él sana, bautiza con poder,\npoderoso es nuestro Dios."
        ]
    },
    {
        "id": "C7", "num": 7, "type": "coro", "title": "No con ejército, ni con espada",
        "stanzas": [
            "// No con ejército, ni con espada,\nsino con su Santo Espíritu //",
            "// Y esos montes se moverán,\ny esos montes se moverán,\ny esos montes se moverán\ncon su Santo Espíritu //"
        ]
    },
    {
        "id": "C8", "num": 8, "type": "coro", "title": "Mirad cuán bueno y cuán delicioso es",
        "stanzas": [
            "// Mirad cuán bueno y cuán delicioso es\nhabitar los hermanos juntos en armonía //",
            "Porque allí envía Jehová bendición y vida eterna,\nporque allí envía Jehová bendición."
        ]
    },
    {
        "id": "C9", "num": 9, "type": "coro", "title": "Bendeciré a Jehová en todo tiempo",
        "stanzas": [
            "// Bendeciré a Jehová en todo tiempo,\nsu alabanza estará de continuo en mi boca //",
            "En Jehová se gloriará mi alma;\nlo oirán los mansos y se alegrarán.\nEngrandeced a Jehová conmigo,\ny exaltemos a una su nombre."
        ]
    },
    {
        "id": "C10", "num": 10, "type": "coro", "title": "Alabad a Jehová, naciones todas",
        "stanzas": [
            "Alabad a Jehová, naciones todas;\npueblos todos, alabadle.\nPorque ha engrandecido sobre nosotros su misericordia,\ny la verdad de Jehová es para siempre. ¡Aleluya!"
        ]
    },
    {
        "id": "C11", "num": 11, "type": "coro", "title": "Con mi Dios yo saltaré los muros",
        "stanzas": [
            "// Con mi Dios yo saltaré los muros,\ncon mi Dios ejércitos derribaré //",
            "Él adiestra mis manos para la batalla,\nde tal manera que se doble el arco de bronce con mis brazos.\nMe diste asimismo el escudo de tu salvación;\ntu diestra me sustentó, y tu benignidad me ha engrandecido."
        ]
    },
    {
        "id": "C12", "num": 12, "type": "coro", "title": "Va bajando ya la gloria de Dios",
        "stanzas": [
            "// Va bajando ya, va bajando ya,\nva bajando la gloria de Dios.\nSi su pueblo empieza a orar\nel Señor va a contestar,\nva bajando la gloria de Dios //"
        ]
    },
    {
        "id": "C13", "num": 13, "type": "coro", "title": "Una mirada de fe",
        "stanzas": [
            "// Una mirada de fe, una mirada al Señor,\nes la que puede salvar al pecador //",
            "// Y si tú vienes a Cristo Jesús,\nÉl te perdonará,\nporque una mirada de fe\nes la que te puede salvar //"
        ]
    },
    {
        "id": "C14", "num": 14, "type": "coro", "title": "Jehová está en medio de ti",
        "stanzas": [
            "Jehová está en medio de ti, poderoso, poderoso;\nÉl salvará, se gozará sobre ti con alegría;\ncallará de amor, se regocijará sobre ti con cánticos.\nJehová está en medio de ti, poderoso, poderoso."
        ]
    },
    {
        "id": "C15", "num": 15, "type": "coro", "title": "Dios está aquí",
        "stanzas": [
            "Dios está aquí, tan cierto como el aire que respiro,\ntan cierto como la mañana se levanta,\ntan cierto como que le hablo y me puede oír.",
            "Santo, Santo, Santo, mi corazón te adora;\nmi corazón sabe decir: ¡Santo eres tú!"
        ]
    },
    {
        "id": "C16", "num": 16, "type": "coro", "title": "En el Salmo 22",
        "stanzas": [
            "// En el Salmo 22 la Biblia lo dice //\n// Que Él habita en la alabanza,\nque Él habita en la alabanza //",
            "// Y si le alaban, se goza,\ny si le alaban, se goza //"
        ]
    },
    {
        "id": "C17", "num": 17, "type": "coro", "title": "Hay victoria en mi Jesús",
        "stanzas": [
            "// Hay victoria, hay victoria, hay victoria en mi Jesús //\n// Las cadenas son rotas en el nombre de Jesús //"
        ]
    },
    {
        "id": "C18", "num": 18, "type": "coro", "title": "Pon aceite en mi lámpara, Señor",
        "stanzas": [
            "// Pon aceite en mi lámpara, Señor //\nque yo quiero servirte con amor,\npon aceite en mi lámpara, Señor.",
            "Señor Jesús, tú eres mi vida,\nSeñor Jesús, tú eres mi amor;\n// Salvaste mi alma perdida,\npor eso te alabo con el corazón //"
        ]
    },
    {
        "id": "C19", "num": 19, "type": "coro", "title": "Cuando el pueblo alaba a Dios",
        "stanzas": [
            "// Cuando el pueblo alaba a Dios suceden cosas,\nsuceden cosas maravillosas //",
            "// Hay sanidad, liberación,\nse siente la presencia del Señor //"
        ]
    },
    {
        "id": "C20", "num": 20, "type": "coro", "title": "Este es el día que hizo el Señor",
        "stanzas": [
            "// Este es el día, este es el día que hizo el Señor //\n// Nos gozaremos y alegraremos en Él //\nEste es el día que hizo el Señor,\nnos gozaremos y alegraremos en Él;\neste es el día, este es el día que hizo el Señor."
        ]
    }
]

# Write all data as JSON files into assets
with open(os.path.join(ASSETS_DIR, "himnos.json"), "w", encoding="utf-8") as f:
    json.dump(himnos_data, f, ensure_ascii=False)

with open(os.path.join(ASSETS_DIR, "coros.json"), "w", encoding="utf-8") as f:
    json.dump(coros_data, f, ensure_ascii=False)

with open(os.path.join(ASSETS_DIR, "biblia.json"), "w", encoding="utf-8") as f:
    json.dump(bible_books, f, ensure_ascii=False)

print("Datos guardados en assets:")
print(f"  himnos.json ({len(himnos_data)} himnos)")
print(f"  coros.json ({len(coros_data)} coros)")
print(f"  biblia.json ({len(bible_books)} libros)")
