import { Injectable } from '@nestjs/common';
import { FileValidator } from '@nestjs/common';
import { fromFile } from 'file-type';

@Injectable()
export class FilesTypeValidator extends FileValidator {
  validationOptions: Record<string, any>;

  async isValid(
    files: Record<string, Express.Multer.File[]>,
  ): Promise<boolean> {
    for (const fieldname in files) {
      const fileArray = files[fieldname];
      for (const file of fileArray) {
        const { ext = '', mime = '' } = await fromFile(file.path);
        const allowedExtensions: string[] = this.mimeTypesToExtensions(
          this.validationOptions.mimeTypes[fieldname],
        );

        if (
          !allowedExtensions.includes(ext) ||
          !this.validationOptions.mimeTypes[fieldname].includes(mime)
        ) {
          return false;
        }
      }
    }
    return true;
  }

  buildErrorMessage(): string {
    return `One or more files have an invalid type`;
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
