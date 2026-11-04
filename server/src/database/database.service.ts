import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, PoolConfig } from "pg";
import { students } from "../modules/students/students.schema";
import { courses } from "../modules/courses/courses.schema";
import { enrollments } from "../modules/enrollments/enrollments.schema";

const schema = { students, courses, enrollments };

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly db: NodePgDatabase<typeof schema>;

  private readonly pool: Pool;

  constructor(private readonly config: ConfigService) {
    this.pool = new Pool(this.createConnectionOptions());
    this.db = drizzle({ client: this.pool, schema });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  private createConnectionOptions(): PoolConfig {
    return this.config.getOrThrow<PoolConfig>('database');
  }
}
