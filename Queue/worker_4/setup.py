from setuptools import setup, find_packages

setup(
    name='Integration',  # Name of your package
    version='0.1.0',  # Initial version
    description='A utility library for common functions',
    author='Adama',
    author_email='Adama@adotwotimes.me',
    # Dynamically find packages
    packages=find_packages(
        include=['utils', 'utils.*']),
    install_requires=[],  # Add dependencies if needed
)
