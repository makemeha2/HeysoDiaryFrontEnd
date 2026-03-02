
const DiarySettingSection = () => {
    return(
    <>
                  <SectionCard
                    title="AI 말투 설정"
                    description="일기 피드백의 톤과 강도를 선택하세요."
                  >
                    <RadioGroup
                      name="aiTone"
                      label="AI 말투"
                      value={diary.aiTone}
                      onChange={(value) => setDiary((prev) => ({ ...prev, aiTone: value }))}
                      options={[
                        { label: '공감형', value: 'empathetic' },
                        { label: '분석형', value: 'analytic' },
                        { label: '친구같은 말투', value: 'friendly' },
                        { label: '잔소리형', value: 'nagging' },
                      ]}
                    />
                    <RadioGroup
                      name="feedbackStrength"
                      label="피드백 강도"
                      value={diary.feedbackStrength}
                      onChange={(value) =>
                        setDiary((prev) => ({ ...prev, feedbackStrength: value }))
                      }
                      options={[
                        { label: '공감', value: 'empathy' },
                        { label: '조언', value: 'advice' },
                        { label: '팩트폭격', value: 'facts' },
                      ]}
                    />
                  </SectionCard>

                  <SectionCard
                    title="기본 일기 언어"
                    description="일기 작성 시 기본 언어를 설정합니다."
                  >
                    <RadioGroup
                      name="defaultLanguage"
                      label="언어 선택"
                      value={diary.defaultLanguage}
                      onChange={(value) =>
                        setDiary((prev) => ({ ...prev, defaultLanguage: value }))
                      }
                      options={[
                        { label: '한국어', value: 'kr' },
                        { label: '영어', value: 'en' },
                        { label: '언어감지', value: 'mix' },
                      ]}
                    />
                  </SectionCard>

                  <SectionCard
                    title="AI 댓글 언어"
                    description="AI 댓글 언어가 일기 언어를 따라갈지, 고정 언어를 사용할지 결정합니다."
                  >
                    <RadioGroup
                      name="aiCommentMode"
                      label="언어 모드"
                      value={diary.aiCommentMode}
                      onChange={(value) => setDiary((prev) => ({ ...prev, aiCommentMode: value }))}
                      options={[
                        { label: '일기 언어 따라가기', value: 'follow' },
                        { label: '고정언어', value: 'fixed' },
                      ]}
                    />
                    {diary.aiCommentMode === 'fixed' && (
                      <SelectField
                        id="fixedLanguage"
                        label="고정 언어 선택"
                        value={diary.fixedLanguage}
                        options={[
                          { label: '한국어', value: 'kr' },
                          { label: '영어', value: 'en' },
                        ]}
                        onChange={(value) =>
                          setDiary((prev) => ({ ...prev, fixedLanguage: value }))
                        }
                      />
                    )}
                  </SectionCard>
    </>);
}

export default DiarySettingSection;