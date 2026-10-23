import React from 'react';
import { FileText, Clock, Scale, Calendar } from 'lucide-react';

interface CheatSheetViewProps {
  onJumpToQuestion: (questionId: number) => void;
}

export const CheatSheetView: React.FC<CheatSheetViewProps> = ({ onJumpToQuestion }) => {
  const sections = [
    {
      title: 'Klíčové zákonné lhůty (Správní řád a související předpisy)',
      icon: Clock,
      items: [
        {
          term: 'Vydání rozhodnutí ve správním řízení',
          value: 'Bezodkladně, nejpozději do 30 dnů',
          detail: 'Lze prodloužit až o dalších 30 dnů (např. nutnost nařídit ústní jednání, místní ohledání, dožádání, posudek).',
          questionIds: [129, 130],
        },
        {
          term: 'Odvolací lhůta proti správnímu rozhodnutí',
          value: '15 dnů ode dne oznámení rozhodnutí',
          detail: 'Odvolání má zpravidla odkladný účinek, podává se u správního orgánu, který rozhodnutí vydal.',
          questionIds: [136, 137],
        },
        {
          term: 'Žádost o informace (Zákon č. 106/1999 Sb.)',
          value: '15 dnů od přijetí žádosti',
          detail: 'Lhůtu lze ze závažných důvodů prodloužit nejvýše o 10 dnů. Stížnost na postup lze podat do 30 dnů.',
          questionIds: [186, 188],
        },
        {
          term: 'Zveřejnění v registru smluv (č. 340/2015 Sb.)',
          value: 'Do 30 dnů, nejpozději do 3 měsíců',
          detail: 'Smlouvy s hodnotou nad 50 000 Kč bez DPH. Není-li zveřejněna do 3 měsíců, je zrušena od samého počátku.',
          questionIds: [221, 222],
        },
        {
          term: 'Zkušební doba (Zákoník práce č. 262/2006 Sb.)',
          value: 'Max. 4 měsíce (8 měsíců u vedoucího)',
          detail: 'Nesmí být sjednána delší než polovina sjednané doby trvání pracovního poměru na dobu určitou.',
          questionIds: [158],
        },
      ],
    },
    {
      title: 'Ústavní instituce, počty a volební období (Ústava ČR)',
      icon: Scale,
      items: [
        {
          term: 'Poslanecká sněmovna Parlamentu ČR',
          value: '200 poslanců na 4 roky, volitelnost od 21 let',
          detail: 'Volby se konají tajným hlasováním na základě poměrného zastoupení. Usnášeníschopná při přítomnosti alespoň 67 poslanců (1/3).',
          questionIds: [5, 6, 7],
        },
        {
          term: 'Senát Parlamentu ČR',
          value: '81 senátorů na 6 let, volitelnost od 40 let',
          detail: 'Volby většinovým systémem ve volebních obvodech. Každé 2 roky se obměňuje jedna třetina (27) senátorů.',
          questionIds: [8, 9, 10],
        },
        {
          term: 'Prezident republiky',
          value: 'Funkční období 5 let, volitelnost od 40 let',
          detail: 'Přímá volba, nikdo nemůže být zvolen více než dvakrát za sebou. Přijaté zákony podepisuje předseda PS, prezident a předseda vlády.',
          questionIds: [1, 14, 15],
        },
        {
          term: 'Ústavní soud České republiky',
          value: '15 soudců na 10 let, jmenuje prezident se souhlasem Senátu',
          detail: 'Podmínka bezúhonnosti, volitelnost do Senátu (věk 40 let), vysokoškolské právnické vzdělání a alespoň 10 let praxe.',
          questionIds: [31, 32, 33],
        },
        {
          term: 'Česká národní banka (ČNB)',
          value: 'Bankovní rada: guvernér + 6 členů na 6 let',
          detail: 'Členy jmenuje a odvolává prezident republiky bez kontrasignace. Hlavním cílem je péče o cenovou stabilitu.',
          questionIds: [38, 39],
        },
      ],
    },
    {
      title: 'Orgány a instituce Evropské unie',
      icon: Calendar,
      items: [
        {
          term: 'Evropská komise (Brusel)',
          value: 'Výkonný orgán, výlučné právo legislativní iniciativy',
          detail: 'Dbá na dodržování smluv EU ("strážkyně smluv"), spravuje rozpočet EU a zastupuje Unii navenek.',
          questionIds: [280, 281],
        },
        {
          term: 'Evropská rada vs. Rada EU (Rada ministrů)',
          value: 'Evropská rada = hlavy států/vlád; Rada EU = resortní ministři',
          detail: 'Evropská rada určuje obecné politické směry a priority, nemá legislativní funkci. Rada EU přijímá předpisy s EP.',
          questionIds: [278, 279],
        },
        {
          term: 'Evropská centrální banka (ECB)',
          value: 'Sídlo ve Frankfurtu nad Mohanem (Německo)',
          detail: 'Řídí měnovou politiku eurozóny a udržuje stabilitu eura a cenovou hladinu.',
          questionIds: [300],
        },
        {
          term: 'Soudní dvůr EU (Lucemburk)',
          value: 'Sídlo v Lucemburku (Lucembursko)',
          detail: 'Zajišťuje jednotný výklad a uplatňování unijního práva ve všech členských státech.',
          questionIds: [285, 286],
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 space-y-2 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Tahák klíčových lhůt, čísel a ústavních pojmů
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Přehledně shrnuté nejčastější chytáky a čísla ze všech 300 otázek zkoušky
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 space-y-4 transition-colors">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{sec.title}</span>
              </h2>

              <div className="divide-y divide-slate-100 dark:divide-slate-700/80">
                {sec.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="py-4 first:pt-2 last:pb-0 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{item.term}</span>
                      <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 px-2.5 py-0.5 rounded-md shrink-0">
                        {item.value}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.detail}</p>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <span>Související otázky:</span>
                      <div className="flex items-center gap-1">
                        {item.questionIds.map((qid) => (
                          <button
                            key={qid}
                            onClick={() => onJumpToQuestion(qid)}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-white font-semibold border border-slate-200 dark:border-slate-600 transition-colors tabular-nums cursor-pointer"
                            title={`Přejít na otázku č. ${qid}`}
                          >
                            č. {qid}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
