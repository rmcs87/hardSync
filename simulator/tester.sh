

for((i=100; i>60; i=$i-10))do
    for((j=0; j<30; j++))do
        time nice -n 0 node simulator.js $i $j >> log/$i.log
    done
done