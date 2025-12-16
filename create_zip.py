import os
import zipfile

def create_wordpress_theme_zip(source_dir, output_filename):
    """
    Creates a WordPress-compatible zip file from a source directory,
    excluding node_modules. The zip file will have the contents of the
    source directory at its root.
    """
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Exclude the node_modules directory from being walked into
            if 'node_modules' in dirs:
                dirs.remove('node_modules')

            for file in files:
                file_path = os.path.join(root, file)
                # The arcname is the path of the file inside the zip archive.
                # It should be relative to the source directory.
                archive_name = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, archive_name)

if __name__ == "__main__":
    theme_dir = 'gifteez-wp-theme'
    zip_name = 'gifteez-wp-theme.zip'
    print(f"Creating {zip_name} from {theme_dir}...")
    # It's better to remove the old zip file first
    if os.path.exists(zip_name):
        os.remove(zip_name)
    create_wordpress_theme_zip(theme_dir, zip_name)
    print("Done.")
