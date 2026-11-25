import { Component, input } from '@angular/core';

/** The four-stage process, shared by the home and the studio page. */
@Component({
  selector: 'app-process-steps',
  templateUrl: './process-steps.html',
  styleUrl: './process-steps.css',
})
export class ProcessSteps {
  readonly sectionId = input('proceso');

  readonly steps = [
    {
      title: $localize`:@@home.step1.title:Entender`,
      text: $localize`:@@home.step1.text:Conversamos sobre tu negocio, el problema y las herramientas que ya usás.`,
      result: $localize`:@@home.step1.result:un diagnóstico claro.`,
    },
    {
      title: $localize`:@@home.step2.title:Definir`,
      text: $localize`:@@home.step2.text:Proponemos alcance, prioridades y plan de trabajo antes de escribir código.`,
      result: $localize`:@@home.step2.result:una propuesta concreta.`,
    },
    {
      title: $localize`:@@home.step3.title:Construir`,
      text: $localize`:@@home.step3.text:Desarrollamos por etapas. En cada entrega revisás avances reales y ajustamos prioridades.`,
      result: $localize`:@@home.step3.result:software probado, listo para usar.`,
    },
    {
      title: $localize`:@@home.step4.title:Acompañar`,
      text: $localize`:@@home.step4.text:Mantenimiento, soporte y nuevas mejoras a medida que tu empresa lo necesita.`,
      result: $localize`:@@home.step4.result:un sistema que evoluciona.`,
    },
  ];
}
