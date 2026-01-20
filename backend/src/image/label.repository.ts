import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Label } from './label.entity';

@Injectable()
export class LabelRepository extends Repository<Label> {
  constructor(private dataSource: DataSource) {
    super(Label, dataSource.createEntityManager());
  }

  async findOrCreate(name: string, color?: string): Promise<Label> {
    let label = await this.findOne({ where: { name } });

    if (!label) {
      label = this.create({ name, color });
      label = await this.save(label);
    }

    return label;
  }

  async findByName(name: string): Promise<Label | null> {
    return this.findOne({ where: { name } });
  }

  async getAllLabels(): Promise<Label[]> {
    return this.find({
      order: { name: 'ASC' },
    });
  }

  async deleteLabel(id: string): Promise<void> {
    await this.delete(id);
  }
}
