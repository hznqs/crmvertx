import { formatModuleValue } from "@/lib/modules/format";
import type { BackendPage } from "@/lib/api/backend";
import type { ModuleDefinition } from "@/lib/modules/registry";

type ModuleTableProps = {
  moduleDefinition: ModuleDefinition;
  page: BackendPage<Record<string, unknown>>;
};

export function ModuleTable({ moduleDefinition, page }: ModuleTableProps) {
  if (page.sourceUnavailable) {
    return (
      <StateBox
        title="Backend indisponivel"
        description={page.loadError ?? "Inicie o Spring Boot em http://localhost:8080 para carregar os dados reais."}
      />
    );
  }

  if (page.loadError) {
    return (
      <StateBox
        title="Nao foi possivel carregar dados"
        description={page.loadError}
      />
    );
  }

  if (page.unauthorized) {
    return (
      <StateBox
        title="Sessao necessaria"
        description="Entre com sua conta para visualizar os dados protegidos deste modulo."
      />
    );
  }

  if (page.content.length === 0) {
    return (
      <StateBox
        title="Nenhum registro encontrado"
        description="Ajuste os filtros ou cadastre um novo item quando os formularios React deste modulo forem ativados."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-white/[0.025] text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              {moduleDefinition.columns.map((column) => (
                <th key={column.key} className="px-5 py-4 font-bold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {page.content.map((record, index) => (
              <tr key={String(record.id ?? index)} className="transition hover:bg-white/[0.035]">
                {moduleDefinition.columns.map((column, columnIndex) => (
                  <td
                    key={column.key}
                    className={[
                      "px-5 py-4",
                      columnIndex === 0 ? "font-semibold text-white" : "text-zinc-300"
                    ].join(" ")}
                  >
                    {column.format === "status" ? (
                      <span className="inline-flex rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-zinc-200">
                        {formatModuleValue(record, column)}
                      </span>
                    ) : (
                      formatModuleValue(record, column)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>
          Pagina {page.number + 1} de {page.totalPages}
        </span>
        <span>{page.totalElements} registros</span>
      </footer>
    </div>
  );
}

function StateBox({
  title,
  description
}: Readonly<{
  title: string;
  description: string;
}>) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}
