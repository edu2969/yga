import XLSX from 'xlsx';

// Labores de manteniemiento
Template.mantencion.events({
  'change .fileInput' (event) {
    const file = event.currentTarget.files[0];
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = function(e) {
      const data = e.target.result;
      const name = file.name;
      
      Meteor.call(rABS ? 'uploadS' : 'uploadU', rABS ? data : new Uint8Array(data), name, function(err, wb) {
        if (err) throw err;        
        const ws = wb.Sheets[wb.SheetNames[0]];
        
        // PROCESANDO PLANILLA DE PROFESIONALES
        var worksheet = wb.Sheets["PROF."];        
        var atributos = ["numero", "rut", "dv", "nombres", "especialidad", "fonofijo", "celular", "email"];
        var doc = {};
        for(let j=4; j<22; j++) {
          for(let i=0; i<8; i++) {
            var celda = worksheet[String.fromCharCode(66 + i) + j];
            var valor = (celda ? celda.v : undefined);
            doc[atributos[i]] = valor;
          }
          //console.log(doc); // AQUI IRIA EL INSERT
          //Meteor.call("ImportPROF", doc);
        }
        
        worksheet = wb.Sheets["PACIENTE"];        
        atributos = [
          "numero", "rut", "dv", "nombres", "rut_titular", 
          "dv_titular", "nombres_titular", "convenio", "correo", 
          "celular", "fecha_pptol", "empresa", "it", "ft", "b"];
        doc = {};
        for(let j=4; j<2882; j++) {
          for(let i=0; i<14; i++) {
            var celda = worksheet[String.fromCharCode(66 + i) + j];
            var valor = (celda ? celda.v : undefined);
            if(valor) 
              doc[atributos[i]] = valor;
          }
          //console.log(doc); // AQUI IRIA EL INSERT
          //Meteor.call("ImportPACIENTES", doc);
        }
        
        worksheet = wb.Sheets["ACCIONES"];        
        atributos = ["codigo", "prestacion", "factor", "total", "lab", 
                    "descuentoF", "laboratorioF", "totalF",
                     "descuentoE", "laboratorioE", "totalE",
                     "descuentoP", "laboratorioP", "totalP",
                     "descuentoC", "laboratorioC", "totalC",
                     "descuentoD", "laboratorioD", "totalD"
                    ];
        doc = {};
        for(let j=6; j<285; j++) {
          for(let i=0; i<20; i++) {
            var celda = worksheet[String.fromCharCode(66 + i) + j];
            var valor = (celda ? celda.v : undefined);
            if(valor && atributos[i].indexOf("total")==-1) 
              doc[atributos[i]] = valor;
          }
          //console.log(doc); // AQUI IRIA EL INSERT
          Meteor.call("ImportACCIONES", doc);
        }
      });
    };
    if(rABS) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
  }
});

function browserSupportFileUpload() {
  var isCompatible = false;
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    isCompatible = true;
  }
  return isCompatible;
}