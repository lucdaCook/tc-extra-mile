detecting toxic clouds!

To run locally:

1. git clone git@github.com:lucdaCook/tc-extra-mile.git

2. conda env create -f back/env.yml

3. conda activate toxic-clouds

4. export PYTHONPATH=$PYTHONPATH:$PWD

5. flask run --port 8000 --debug

6. cd front && npm i

7. npm start