/*var PDFBuilder = function(empresa, cotizacionId) {
  this.empresa = empresa;
  this.cotizacionId = cotizacionId;
  this.documento = null;
  
  this.render = function() {
    switch(empresa) {
      case "yga": 
        this.configurarDocumento("A4");
        this.agregarPortada("PERSONALIZADA");
        this.agregarObjetivoss();
        this.agregarRequerimientos();
        this.agregarPropuesta();
        this.agregarCondiciones("MODERNA", [
          {
            "clausula": "El servicio entregado corresponde a Asesoría en Tecnologías de Información y entrega de herramientas de software para la gestión del negocio."            
          }, {
            "pago": "La forma de pago, en modalidad depósito efectivo, debe ser realizado a",
            "cuenta": "Cuenta RUT - BancoEstado",
            "datos": "Eduardo Troncoso Mendoza, 12.973.705-0",
            "comprobante": "enviando el comprobante a hola@yga.cl"
          },
          {
            "contacto": true
          },
          {
            "clausula": "En caso de requerir factura, ésta se entrega por medio de la empresa TyT Ltda. a través de una cotización formal que respeta los valores expuestos en éste documento. Al solicitar su factura, se indicarán la forma de pago asociada."
          }
        ]);      
    }
    return this.documento;
  }
  
  this.configurarDocumento = function(size) {
    if(size=="A4") {
      this.documento = new PDFKit({
        size: 'Letter',
        margins: {
          top: 50,
          bottom: 0,
          left: 50,
          right: 50,
        }
      });
    } else {
      console.log("TIPO DE DOCUMENTO NO IMPLEMENTADO");
    }    
  }
  
  this.agregarPortada = function(tipo) {
    if(tipo=="PERSONALIZADA") {
      
    }
  }
}*/