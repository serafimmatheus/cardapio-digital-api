import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async enviarEmail(email: string, mensagem: string) {
    await this.mailerService.sendMail({
      to: email,
      from: 'serafim@mentores.com.br',
      cc: email,
      subject: 'Enviando Email com NestJS',
      html: `<h3 style="color: black">
        <a href=${mensagem}>Clique aqui</a> para alterar a senha.
      </h3>`,
    });
  }
}
