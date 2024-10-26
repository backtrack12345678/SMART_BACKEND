import { Injectable } from '@nestjs/common';
import { FileValidator } from '@nestjs/common';
import { fromFile } from 'file-type';

@Injectable()
export class FileTypeValidator extends FileValidator {
  validationOptions: Record<string, any>;

  async isValid(file: Express.Multer.File): Promise<boolean> {
    const { ext = '', mime = '' } = await fromFile(file.path);
    const allowedExtensions: string[] = this.mimeTypesToExtensions(
      this.validationOptions.mimeTypes[file.fieldname],
    );

    return (
      allowedExtensions.includes(ext) &&
      this.validationOptions.mimeTypes[file.fieldname].includes(mime)
    );
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return `File type for ${file.fieldname} not allowed`;
  }

  private mimeTypesToExtensions(mimeTypes: string[]): string[] {
    const extensions: string[] = [];
    mimeTypes.forEach((mimeType) => {
      const ext = mimeType.split('/')[1];
      extensions.push(`${ext}`);
    });
    return extensions;
  }
}
