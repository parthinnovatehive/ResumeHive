from app.modules.resumes.pdf_generator import generate_pdf

def test():
    try:
        pdf_bytes = generate_pdf({"full_name": "Test User"}, template="classic")
        print(f"Generated {len(pdf_bytes)} bytes of PDF.")
    except Exception as e:
        import traceback
        traceback.print_exc()

test()
