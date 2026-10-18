import pdfplumber
import PyPDF2
from typing import Tuple, Optional
import os


def extract_text_from_pdf(file_path: str) -> Tuple[str, Optional[str]]:
    """
    Extract text from PDF file using pdfplumber with PyPDF2 fallback.
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        Tuple of (extracted_text, error_message)
        If successful, error_message is None
        If failed, extracted_text is empty string and error_message contains details
    """
    try:
        # Try pdfplumber first
        with pdfplumber.open(file_path) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            
            if text.strip():
                return text.strip(), None
            else:
                # pdfplumber succeeded but extracted no text, try PyPDF2
                return _extract_with_pypdf2(file_path)
                
    except Exception as e:
        # pdfplumber failed, try PyPDF2 as fallback
        return _extract_with_pypdf2(file_path, str(e))


def _extract_with_pypdf2(file_path: str, original_error: str = None) -> Tuple[str, Optional[str]]:
    """
    Fallback method using PyPDF2 to extract text from PDF.
    
    Args:
        file_path: Path to the PDF file
        original_error: Error message from previous attempt (if any)
        
    Returns:
        Tuple of (extracted_text, error_message)
    """
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            
            if text.strip():
                return text.strip(), None
            else:
                error_msg = original_error if original_error else "No text could be extracted from PDF"
                return "", f"PDF extraction failed: {error_msg}"
                
    except Exception as e:
        error_msg = f"PyPDF2 extraction failed: {str(e)}"
        if original_error:
            error_msg = f"pdfplumber failed: {original_error}. {error_msg}"
        return "", error_msg


def get_pdf_metadata(file_path: str) -> dict:
    """
    Get basic metadata about the PDF file.
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        Dictionary with metadata (page_count, file_size, etc.)
    """
    try:
        file_size = os.path.getsize(file_path)
        
        # Try to get page count
        try:
            with pdfplumber.open(file_path) as pdf:
                page_count = len(pdf.pages)
        except:
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    page_count = len(pdf_reader.pages)
            except:
                page_count = 0
        
        return {
            "file_size": file_size,
            "page_count": page_count,
            "filename": os.path.basename(file_path)
        }
    except Exception as e:
        return {
            "file_size": 0,
            "page_count": 0,
            "filename": os.path.basename(file_path),
            "error": str(e)
        }
