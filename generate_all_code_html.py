import os
import html

# Directories and files to exclude
EXCLUDE_DIRS = ['.git', '.idea', '.vscode', 'node_modules', 'dist', 'build', 'target', '__pycache__', 'public', 'assets']
EXCLUDE_EXTS = ['.pdf', '.jpg', '.png', '.svg', '.jar', '.class', '.pyc']

output_file = 'all_code_context.html'

def generate_html():
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write('<html><head><title>All Code Context</title>')
        out.write('<style>body { font-family: Arial, sans-serif; } pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; } h2 { color: #333; } </style>')
        out.write('</head><body>')
        out.write('<h1>Asset Maintenance Automation System - Full Code Context</h1>')
        
        # Read code context markdown
        if os.path.exists('code_context.md'):
            with open('code_context.md', 'r', encoding='utf-8') as md_file:
                out.write('<h2>Architecture Overview</h2>')
                out.write('<pre>' + html.escape(md_file.read()) + '</pre>')

        out.write('<h2>Source Files</h2>')
        
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to exclude unwanted directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                if any(file.endswith(ext) for ext in EXCLUDE_EXTS):
                    continue
                # Skip the python script itself and generated files
                if file in ['generate_all_code_html.py', 'code_context.md', 'code_context.pdf', 'all_code_context.html', 'package-lock.json']:
                    continue
                
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        out.write('<h3>' + html.escape(filepath) + '</h3>')
                        out.write('<pre><code>' + html.escape(content) + '</code></pre>')
                except Exception as e:
                    pass # Skip unreadable files
                    
        out.write('</body></html>')
        print(f"Generated {output_file}")

if __name__ == '__main__':
    generate_html()
