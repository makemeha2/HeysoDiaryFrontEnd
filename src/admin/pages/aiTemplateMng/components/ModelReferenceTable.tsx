import React from 'react';
import { MODEL_REFERENCE } from '../constants/formDefaults';

const ModelReferenceTable = () => {
  return (
    <div className="mt-2">
      <h3 className="mb-2 text-xs font-semibold text-clay/80">AI 모델 참조표 (일기/글쓰기 관점)</h3>
      <div className="overflow-auto rounded-lg border border-sand/60">
        <table className="w-full min-w-[560px] text-xs">
          <thead>
            <tr className="bg-sand/40 text-left text-clay">
              <th className="px-3 py-2 font-semibold">구분</th>
              <th className="px-3 py-2 font-semibold">모델</th>
              <th className="px-3 py-2 font-semibold">특징 (일기/글쓰기 관점)</th>
              <th className="px-3 py-2 font-semibold">추천 용도</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/40">
            {(() => {
              const rows: React.ReactNode[] = [];
              let i = 0;
              while (i < MODEL_REFERENCE.length) {
                const providerName = MODEL_REFERENCE[i].provider;
                if (providerName) {
                  let span = 1;
                  while (i + span < MODEL_REFERENCE.length && !MODEL_REFERENCE[i + span].provider) {
                    span++;
                  }
                  for (let j = 0; j < span; j++) {
                    const item = MODEL_REFERENCE[i + j];
                    rows.push(
                      <tr key={item.model} className="bg-white hover:bg-linen/60">
                        {j === 0 && (
                          <td
                            rowSpan={span}
                            className="border-r border-sand/40 px-3 py-2 align-middle font-semibold text-clay"
                          >
                            {providerName}
                          </td>
                        )}
                        <td className="px-3 py-2 font-medium text-clay">{item.model}</td>
                        <td className="px-3 py-2 text-clay/80">{item.feature}</td>
                        <td className="px-3 py-2 text-clay/80">{item.usage}</td>
                      </tr>,
                    );
                  }
                  i += span;
                } else {
                  i++;
                }
              }
              return rows;
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelReferenceTable;
