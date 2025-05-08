import { useEffect } from 'react';

/**
 * Custom hook to update document title
 * @param {string} title - The title to set for the document
 */
export const useDocumentTitle = (title) => {
  useEffect(() => {
    // Save the original title to restore it on component unmount
    const originalTitle = document.title;
    
    // Set the new title
    document.title = title;
    
    // Restore the original title when component unmounts
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};