import os

EXCLUDE_DIRS = ['.git', '.idea', '.vscode', 'node_modules', 'dist', 'build', 'target', '__pycache__', 'public', 'assets', '.gemini']
EXCLUDE_EXTS = ['.pdf', '.jpg', '.png', '.svg', '.jar', '.class', '.pyc', '.ico', '.woff', '.woff2', '.ttf']
EXCLUDE_FILES = [
    'generate_all_code_html.py', 
    'generate_complete_codebase_md.py',
    'code_context.md', 
    'all_code_context.html', 
    'package-lock.json', 
    'complete_codebase_guide.md',
    'project_learning_guide.md'
]

output_file = 'complete_codebase_guide.md'

def generate_markdown():
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write('# Asset Maintenance Automation System - Full Codebase Source Code\n\n')
        out.write('This document contains the complete, unabridged source code for every file in both the Spring Boot backend and the React/Vite frontend. Use this file to review, search, and export the entire project structure.\n\n')
        
        # Read code context if it exists
        if os.path.exists('code_context.md'):
            with open('code_context.md', 'r', encoding='utf-8') as md_file:
                out.write('## Architecture and Structure Overview\n\n')
                out.write(md_file.read())
                out.write('\n\n---\n\n')

        out.write('## Source Code Files\n\n')

        # To order logically, collect files first
        file_entries = []
        for root, dirs, files in os.walk('.'):
            # Exclude unwanted directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                if any(file.endswith(ext) for ext in EXCLUDE_EXTS):
                    continue
                if file in EXCLUDE_FILES:
                    continue
                
                filepath = os.path.join(root, file)
                file_entries.append(filepath)

        # Sort file entries alphabetically for clean presentation
        file_entries.sort()

        for filepath in file_entries:
            # Get extension for markdown syntax highlighting
            _, ext = os.path.splitext(filepath)
            lang_map = {
                '.java': 'java',
                '.jsx': 'jsx',
                '.js': 'javascript',
                '.html': 'html',
                '.css': 'css',
                '.xml': 'xml',
                '.properties': 'properties',
                '.md': 'markdown',
                '.py': 'python',
                '.json': 'json',
                '.cmd': 'powershell',
                '.sh': 'bash'
            }
            lang = lang_map.get(ext.lower(), '')

            # Normalize path slashes for cross-platform presentation
            display_path = filepath.replace('\\', '/')
            if display_path.startswith('./'):
                display_path = display_path[2:]

            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    out.write(f'### File: `{display_path}`\n\n')
                    out.write(f'```{lang}\n')
                    out.write(content)
                    if not content.endswith('\n'):
                        out.write('\n')
                    out.write('```\n\n---\n\n')
            except Exception as e:
                # Skip unreadable/binary files
                pass

        print(f"Generated {output_file}")

if __name__ == '__main__':
    generate_markdown()
