import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button"

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pt-BR' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button onClick={toggleLanguage} className="language-toggle">
      {i18n.language === 'en' ? 'PT-BR' : 'EN'}
    </Button>
  );
};

export default LanguageToggle;
